import { describe, expect, it } from "vitest";
import { buildResetUrl, createResetToken, hashToken, resetIdentifier } from "./password-reset";
import { forgotPasswordSchema, resetPasswordSchema } from "./validations/auth";

describe("reset tokens", () => {
  it("are long, random and never repeat", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => createResetToken().token));
    expect(tokens.size).toBe(200);
    expect([...tokens][0].length).toBeGreaterThanOrEqual(43); // 256 bits, base64url
    expect([...tokens][0]).toMatch(/^[A-Za-z0-9_-]+$/); // safe inside a URL
  });

  it("store only a hash that matches the emailed token", () => {
    const { token, hash } = createResetToken();
    expect(hash).not.toContain(token);
    expect(hash).toBe(hashToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token + "x")).not.toBe(hash);
  });

  it("use a case-insensitive identifier per email", () => {
    expect(resetIdentifier(" Ann@Gmail.com ")).toBe("reset:ann@gmail.com");
  });
});

describe("buildResetUrl", () => {
  it("points at the configured site and escapes the email", () => {
    const url = new URL(buildResetUrl("https://blog.example.com", "tok_123", "a+b@gmail.com"));
    expect(url.origin).toBe("https://blog.example.com");
    expect(url.pathname).toBe("/auth/reset-password");
    expect(url.searchParams.get("token")).toBe("tok_123");
    expect(url.searchParams.get("email")).toBe("a+b@gmail.com");
  });
});

describe("password reset validation", () => {
  it("normalises the email", () => {
    expect(forgotPasswordSchema.parse({ email: " Ann@Gmail.COM " }).email).toBe("ann@gmail.com");
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });

  it("enforces the same password rules as sign-up", () => {
    const base = { email: "a@b.co", token: "x".repeat(43) };
    expect(resetPasswordSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...base, password: "x".repeat(73) }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...base, password: "long-enough-1" }).success).toBe(true);
  });

  it("rejects missing or absurd tokens", () => {
    const ok = { email: "a@b.co", password: "long-enough-1" };
    expect(resetPasswordSchema.safeParse({ ...ok, token: "" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...ok, token: "x".repeat(500) }).success).toBe(false);
  });
});
