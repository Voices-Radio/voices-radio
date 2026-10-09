import "server-only";
import { headers } from "next/headers";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { getClientIp } from "@/lib/voices/rate-limit";

/**
 * Headers that tell the Voices backend who the real visitor is.
 *
 * Every membership call is made from this server, so the backend sees a Vercel
 * egress IP — one shared rate-limit bucket (login 5 / 15 min, refresh 20 / 15
 * min) for ALL visitors. We forward the visitor's IP, authenticated with a
 * shared secret so the backend only trusts it from us (see
 * voices_backend/middleware/rateLimiter.js `clientKey`).
 *
 * Returns {} when the secret isn't configured or there's no request scope, in
 * which case the backend falls back to req.ip — exactly the old behaviour — so
 * a missing secret degrades safely rather than breaking auth.
 */
export async function backendClientHeaders(): Promise<Record<string, string>> {
  const secret = process.env.WEBSITE_PROXY_SECRET;
  if (!secret) return {};

  try {
    const ip = getClientIp(await headers());
    if (ip === "unknown") return {};

    return {
      "X-Voices-Client-IP": ip,
      "X-Voices-Proxy-Secret": secret,
    };
  } catch (error) {
    // Let Next's dynamic-usage bailout through (see next-control-flow.ts);
    // anything else (no request scope, e.g. in a script) just means no IP.
    if (isNextControlFlowError(error)) throw error;
    return {};
  }
}
