import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

/**
 * Lazily build rate limiters. Falls back to a permissive no-op in dev when
 * Upstash isn't configured so local work isn't blocked.
 */
const noop = {
  limit: async (_id: string) => ({ success: true, remaining: 999, reset: 0, limit: 999 }),
};

function makeLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return noop;
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "rl",
  });
}

export const limiters = {
  login: makeLimiter(5, "1 m"),
  signup: makeLimiter(3, "1 h"),
  passwordReset: makeLimiter(3, "1 h"),
  contact: makeLimiter(3, "1 h"),
  newsletter: makeLimiter(3, "1 h"),
  apiGlobal: makeLimiter(60, "1 m"),
};

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
