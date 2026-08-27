import "server-only";
import { env } from "@/env";

/**
 * Auth gate for the `/api/voices/admin-*` routes.
 *
 * Those routes exist solely to serve custom inputs inside the embedded Sanity
 * Studio at /studio, and they lend a server-side credential
 * (VOICES_API_ADMIN_TOKEN) to whoever calls them. Without a gate they are a
 * confused deputy: any anonymous caller can drive the upstream admin API.
 *
 * The caller is a Studio user, NOT a Voices membership user, so getSession()
 * is the wrong check — a CMS editor has no voices_at cookie. Instead we take
 * the Studio's own Sanity token and validate it against the PROJECT-scoped
 * users/me endpoint. Project-scoped matters: a valid token for some unrelated
 * Sanity project must not pass this gate.
 */

const SANITY_API_VERSION = "v2021-06-07";

// The show picker searches on a 250ms debounce, so a single editor typing a
// query produces a burst of requests. Cache positive validations briefly so we
// don't issue one users/me round-trip per keystroke. Failures are never cached
// — a revoked token must stop working promptly.
const VALIDATION_TTL_MS = 60_000;
const validatedTokens = new Map<string, number>();

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function isCachedValid(token: string) {
  const expiresAt = validatedTokens.get(token);
  if (expiresAt === undefined) return false;

  if (expiresAt <= Date.now()) {
    validatedTokens.delete(token);
    return false;
  }

  return true;
}

async function isValidStudioToken(token: string) {
  if (isCachedValid(token)) return true;

  try {
    const response = await fetch(
      `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/users/me`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) return false;

    const payload = await response.json().catch(() => null);
    if (!payload?.id) return false;

    validatedTokens.set(token, Date.now() + VALIDATION_TTL_MS);
    return true;
  } catch (error) {
    console.error("Sanity Studio token validation failed:", error);
    return false;
  }
}

/**
 * Returns null when the caller is an authenticated Studio user, or a ready-to
 * -return 401 Response when they are not. Deliberately returns the same opaque
 * message for "no token" and "bad token" so this can't be used to probe.
 */
export async function requireStudioUser(request: Request) {
  const token = readBearerToken(request);

  if (!token || !(await isValidStudioToken(token))) {
    return Response.json(
      { error: "This endpoint requires an authenticated Sanity Studio session." },
      { status: 401 },
    );
  }

  return null;
}
