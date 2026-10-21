import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth(authConfig);

export const { handlers, signIn, signOut } = nextAuth;

/**
 * `auth()` for reading the session, or `auth(handler)` to wrap a proxy/route.
 *
 * Reading the session never throws: a cookie that cannot be decoded (signed with an old
 * secret, truncated, tampered with) is treated as "signed out". Without this, one stale
 * cookie crashes every page that renders the header.
 */
export const auth: typeof nextAuth.auth = ((...args: unknown[]) => {
  const raw = nextAuth.auth as (...a: unknown[]) => unknown;
  if (args.length > 0) return raw(...args); // wrapper usage, e.g. in proxy.ts
  return Promise.resolve(raw()).catch((error) => {
    console.warn(
      "Ignoring unreadable session cookie:",
      (error as Error)?.name ?? error,
    );
    return null;
  });
}) as typeof nextAuth.auth;

// Export authOptions for backward compatibility with getServerSession
export const authOptions = authConfig;

// Wrapper for getServerSession compatibility (NextAuth v5 uses auth() instead)
export async function getServerSession() {
  return await auth();
}

export type { Session } from "next-auth";
