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

// Cap + sweep so the cache can't grow without bound. Entries were only ever
// evicted on lookup, so a token validated once and never seen again stayed for
// the life of the process.
const MAX_CACHED_TOKENS = 500;
const validatedTokens = new Map<string, number>();

/**
 * Cache key. Hashing means a memory dump or an accidental log of this Map
 * doesn't hand over usable Sanity credentials — the raw bearer token never
 * becomes a long-lived key.
 */
async function tokenCacheKey(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function sweepExpired(now: number) {
  for (const [key, expiresAt] of validatedTokens) {
    if (expiresAt <= now) validatedTokens.delete(key);
  }
}

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function isCachedValid(key: string) {
  const expiresAt = validatedTokens.get(key);
  if (expiresAt === undefined) return false;

  if (expiresAt <= Date.now()) {
    validatedTokens.delete(key);
    return false;
  }

  return true;
}

function rememberValid(key: string) {
  const now = Date.now();

  if (validatedTokens.size >= MAX_CACHED_TOKENS) {
    sweepExpired(now);

    // Still full after sweeping means genuine churn, not stale entries. Drop
    // the oldest insertion (Map preserves insertion order) rather than letting
    // the Map grow.
    if (validatedTokens.size >= MAX_CACHED_TOKENS) {
      const oldest = validatedTokens.keys().next().value;
      if (oldest !== undefined) validatedTokens.delete(oldest);
    }
  }

  validatedTokens.set(key, now + VALIDATION_TTL_MS);
}

async function isValidStudioToken(token: string) {
  const cacheKey = await tokenCacheKey(token);
  if (isCachedValid(cacheKey)) return true;

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

    rememberValid(cacheKey);
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
