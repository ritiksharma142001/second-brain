import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Export authOptions for backward compatibility with getServerSession
export const authOptions = authConfig;

// Wrapper for getServerSession compatibility (NextAuth v5 uses auth() instead)
export async function getServerSession() {
  return await auth();
}

export type { Session } from "next-auth";
