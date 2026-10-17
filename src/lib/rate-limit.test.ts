import { describe, expect, it } from "vitest";
import { getClientIp, rateLimit, resetRateLimit, LIMITS } from "./rate-limit";

describe("rateLimit", () => {
  it("blocks after the configured number of points and reports retryAfter", async () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < LIMITS.register.points; i++) {
      expect((await rateLimit("register", key)).ok).toBe(true);
    }
    const blocked = await rateLimit("register", key);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("can be reset (successful login)", async () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < LIMITS.login.points; i++) await rateLimit("login", key);
    expect((await rateLimit("login", key)).ok).toBe(false);
    await resetRateLimit("login", key);
    expect((await rateLimit("login", key)).ok).toBe(true);
  });

  it("keys are independent", async () => {
    for (let i = 0; i < LIMITS.register.points; i++) await rateLimit("register", "a-ip");
    expect((await rateLimit("register", "b-ip")).ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(getClientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
