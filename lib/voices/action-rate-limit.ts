import "server-only";
import { headers } from "next/headers";
import {
  checkRateLimit,
  RATE_LIMITED_MESSAGE,
  type RateLimitRule,
} from "./rate-limit";

/**
 * Rate limit for a Server Action. The sign-in/create-account/password forms
 * post to server actions, not to /api/auth/*, so the route-handler limiter
 * never ran on the path people (and attackers) actually use.
 *
 * Returns a user-facing message when the caller is over the limit, else null:
 *
 *   const limited = await actionRateLimited(AUTH_RATE_LIMITS.login);
 *   if (limited) return { formError: limited };
 */
export async function actionRateLimited(rule: RateLimitRule): Promise<string | null> {
  const result = await checkRateLimit(await headers(), rule);
  return result.limited ? RATE_LIMITED_MESSAGE : null;
}
