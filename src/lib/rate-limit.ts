import { RateLimiterMemory } from "rate-limiter-flexible";

/**
 * In-memory rate limiting. Counters live in this process, so on multiple
 * instances each one enforces its own limit; swap RateLimiterMemory for
 * RateLimiterRedis if you scale horizontally.
 */

export interface LimitConfig {
  /** Max requests allowed per window. */
  points: number;
  /** Window length in seconds. */
  duration: number;
}

export const LIMITS = {
  register: { points: 5, duration: 60 * 60 },
  login: { points: 10, duration: 15 * 60 },
  comment: { points: 10, duration: 60 },
  search: { points: 30, duration: 60 },
  write: { points: 30, duration: 60 },
  upload: { points: 20, duration: 10 * 60 },
} satisfies Record<string, LimitConfig>;

export type LimitName = keyof typeof LIMITS;

const globalForLimiters = globalThis as unknown as {
  limiters?: Map<LimitName, RateLimiterMemory>;
};
const limiters = (globalForLimiters.limiters ??= new Map());

function getLimiter(name: LimitName) {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new RateLimiterMemory({ keyPrefix: name, ...LIMITS[name] });
    limiters.set(name, limiter);
  }
  return limiter;
}

export interface LimitResult {
  ok: boolean;
  /** Seconds until the client may retry (0 when ok). */
  retryAfter: number;
}

/** Consumes one point for `key`; returns ok=false once the limit is exceeded. */
export async function rateLimit(name: LimitName, key: string): Promise<LimitResult> {
  try {
    await getLimiter(name).consume(key);
    return { ok: true, retryAfter: 0 };
  } catch (res) {
    const msBeforeNext = (res as { msBeforeNext?: number }).msBeforeNext ?? 1000;
    return { ok: false, retryAfter: Math.max(1, Math.ceil(msBeforeNext / 1000)) };
  }
}

/** Clears the counter for `key` (e.g. after a successful login). */
export async function resetRateLimit(name: LimitName, key: string) {
  await getLimiter(name).delete(key);
}

/** Best-effort client IP. Only trustworthy behind a proxy that sets these headers. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
