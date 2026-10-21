import { createHash, randomBytes } from "node:crypto";

/** A reset link stops working after this long. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Reset tokens live in NextAuth's VerificationToken table under this identifier. */
export const resetIdentifier = (email: string) =>
  `reset:${email.trim().toLowerCase()}`;

/** Only the SHA-256 hash is stored, so a leaked database cannot be used to reset passwords. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A fresh 256-bit random token: send `token` to the user, store `hash`. */
export function createResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

/**
 * The link emailed to the user. The base URL comes from configuration, never from the
 * request's Host header, which an attacker could forge to point the link at their own site.
 */
export function buildResetUrl(
  baseUrl: string,
  token: string,
  email: string,
): string {
  const url = new URL("/auth/reset-password", baseUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
}

export function siteBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}
