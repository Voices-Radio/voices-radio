import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * IP rate limiting for the unauthenticated auth endpoints.
 *
 * Two deliberate design choices:
 *
 * 1. FAIL OPEN. If Redis is unreachable or unconfigured, requests are allowed.
 *    A rate limiter that fails closed turns a Redis blip into a total sign-in
 *    outage for every member — a worse incident than the abuse it prevents.
 *    Failures are logged so the gap is visible rather than silent.
 *
 * 2. Serverless-safe by construction. In-memory counters cannot work here:
 *    each Vercel invocation may be a fresh isolate, so a local Map would
 *    enforce nothing while appearing to work.
 */

type RateLimitRule = {
  /** Distinct prefix per endpoint so limits don't share a bucket. */
  name: string;
  limit: number;
  window: `${number} s` | `${number} m` | `${number} h`;
};

export const AUTH_RATE_LIMITS = {
  login: { name: "login", limit: 10, window: "10 m" },
  register: { name: "register", limit: 5, window: "1 h" },
  checkEmail: { name: "check-email", limit: 20, window: "10 m" },
} as const satisfies Record<string, RateLimitRule>;

function getRedis() {
  // Vercel's Upstash marketplace integration injects KV_REST_API_* while a
  // database provisioned directly in the Upstash console gives UPSTASH_*.
  // Accept either so the limiter activates regardless of how it was set up.
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

const redis = getRedis();
let warnedAboutMissingRedis = false;

// One limiter per rule, built once per process rather than per request.
const limiters = new Map<string, Ratelimit>();

function getLimiter(rule: RateLimitRule) {
  if (!redis) return null;

  const existing = limiters.get(rule.name);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
    prefix: `voices:rl:${rule.name}`,
    analytics: false,
  });

  limiters.set(rule.name, limiter);
  return limiter;
}

/**
 * Vercel sets x-forwarded-for; the left-most entry is the real client. Falls
 * back to a shared bucket rather than skipping the limit entirely, so a
 * missing header can't be used to opt out.
 */
function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Returns null when the request may proceed, or a ready-to-return 429.
 */
export async function enforceRateLimit(request: Request, rule: RateLimitRule) {
  const limiter = getLimiter(rule);

  if (!limiter) {
    if (!warnedAboutMissingRedis) {
      warnedAboutMissingRedis = true;
      console.warn(
        "Rate limiting is DISABLED: UPSTASH_REDIS_REST_URL / _TOKEN are not set.",
      );
    }
    return null;
  }

  try {
    const { success, reset } = await limiter.limit(getClientIp(request));
    if (success) return null;

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000),
    );

    return Response.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many attempts. Please wait a moment and try again.",
        },
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  } catch (error) {
    // Fail open — see the note at the top of this file.
    console.error(`Rate limit check failed for ${rule.name}:`, error);
    return null;
  }
}
