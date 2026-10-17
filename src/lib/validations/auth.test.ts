import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("registerSchema", () => {
  it("normalises the email", () => {
    const r = registerSchema.parse({ name: "Ann", email: " Ann@Gmail.COM ", password: "password123" });
    expect(r.email).toBe("ann@gmail.com");
  });

  it("rejects short and overly long passwords", () => {
    expect(registerSchema.safeParse({ name: "Ann", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ann", email: "a@b.co", password: "x".repeat(73) }).success).toBe(false);
  });

  it("rejects invalid emails and tiny names", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "password123" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ann", email: "nope", password: "password123" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
