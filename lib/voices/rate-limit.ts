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

/**
 * Limits for unauthenticated endpoints that aren't auth, but do real work per
 * request. These are abuse ceilings, not usage budgets — set well above what a
 * person can generate so they never bite a real visitor.
 */
export const PUBLIC_RATE_LIMITS = {
  // Each call fans out to two Sanity queries plus one upstream API request.
  // The search box debounces at 250ms, so a fast typist mid-query produces a
  // handful per minute; 60 leaves a wide margin over that.
  search: { name: "search", limit: 60, window: "1 m" },
  // Sanity's webhook fires on publish. Bounded because the route buffers a
  // request body before it can verify the signature.
  revalidate: { name: "revalidate", limit: 60, window: "1 m" },
} as const satisfies Record<string, RateLimitRule>;

function getRedis() {
  // Vercel's Upstash marketplace integration injects KV_REST_API_* while a
  // database provisioned directly in the Upstash console gives UPSTASH_*.
  // Accept either so the limiter activates regardless of how it was set up.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

const redis = getRedis();
let warnedAboutMissingRedis = false;

/**
 * Escalates the missing-Redis warning in production.
 *
 * Fail-open (see above) is the right call for availability, but it means an
 * unconfigured production deploy looks completely healthy while login,
 * register and check-email all run unthrottled — and check-email is an account
 * enumeration oracle. One `console.warn` among Vercel's normal build chatter is
 * not proportionate to that. This makes the gap findable by searching logs for
 * a fixed string.
 *
 * Deliberately NOT a thrown error: taking the whole site down over a missing
 * optional credential is a worse outcome than the abuse it would prevent, and
 * a boot failure at go-live is the wrong moment to discover it. Promote to a
 * throw once Upstash is provisioned and this can never legitimately be unset.
 */
function reportMissingRedis() {
  if (warnedAboutMissingRedis) return;
  warnedAboutMissingRedis = true;

  if (process.env.NEXT_PUBLIC_SITE_ENV === "production") {
    console.error(
      "RATE_LIMITING_DISABLED_IN_PRODUCTION: no UPSTASH_REDIS_REST_URL/_TOKEN " +
        "or KV_REST_API_URL/_TOKEN is set. Auth endpoints are unthrottled.",
    );
    return;
  }

  console.warn(
    "Rate limiting is DISABLED: UPSTASH_REDIS_REST_URL / _TOKEN are not set.",
  );
}

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
 * Identifies the caller for bucketing purposes.
 *
 * Order matters, and the obvious order is wrong. `x-forwarded-for` is a
 * PASS-THROUGH header: a caller sets their own value and the platform appends
 * the observed IP rather than replacing what arrived. Reading the left-most
 * entry therefore reads attacker-controlled input — send
 * `x-forwarded-for: <random>` on each request and every limit below becomes a
 * fresh bucket, which defeats the point of having them.
 *
 * `x-real-ip` is written by the edge from the actual TCP peer, so it is the
 * one to trust. XFF stays as a fallback for environments that only set that,
 * and an absent header falls into a single shared bucket rather than skipping
 * the limit, so stripping headers can't be used to opt out either.
 *
 * Exported for tests.
 */
export function getClientIp(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

/**
 * Returns null when the request may proceed, or a ready-to-return 429.
 */
export async function enforceRateLimit(request: Request, rule: RateLimitRule) {
  const limiter = getLimiter(rule);

  if (!limiter) {
    reportMissingRedis();
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
