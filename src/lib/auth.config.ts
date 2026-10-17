import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export const authConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Throttle attempts per email + IP to slow down password guessing.
        const limitKey = `${parsed.data.email}|${getClientIp(request.headers)}`;
        const limit = await rateLimit("login", limitKey);
        if (!limit.ok) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const valid = await compare(parsed.data.password, user.password);
        if (!valid) return null;

        await resetRateLimit("login", limitKey);

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
      },
    }),
    // Google sign-in is enabled only when its credentials are configured.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            // Google verifies emails, so link it to an existing password user with the same address.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role;
      }
      // After a profile edit (`update()` on the client) reload fields from the
      // database rather than trusting anything sent by the browser.
      if (trigger === "update" && token.id) {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, image: true, role: true },
        });
        if (fresh) {
          token.name = fresh.name;
          token.picture = fresh.image;
          token.role = fresh.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  // Credentials login requires JWT sessions.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
