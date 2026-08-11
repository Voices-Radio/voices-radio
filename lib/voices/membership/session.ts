import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { safeInternalPath } from "./paths";

const ACCESS_COOKIE = "voices_at";
const REFRESH_COOKIE = "voices_rt";

// Matches the backend's documented token lifetimes (1h / 30d).
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface VoicesSessionUser {
  _id: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  role?: string;
}

type AuthTokens = { token: string; refreshToken: string };

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Route Handler / Server Action only — cookie mutation isn't allowed elsewhere. */
export async function setSessionCookies({ token, refreshToken }: AuthTokens) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, token, cookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
  store.set(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

/** Route Handler / Server Action only. */
export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

/**
 * Read-only session check — safe from Server Components. Validates the
 * current access token against the backend and returns the user, or null.
 *
 * Deliberately does NOT attempt a refresh: refreshing mutates cookies, and
 * Next.js only allows cookie mutation from Route Handlers / Server Actions,
 * not from Server Component render. If the access token has expired
 * (>1h old), this returns null and callers should send the visitor to
 * /sign-in. Route Handlers / Server Actions that need a session to survive
 * longer than an hour should use authedFetch() below instead.
 *
 * Wrapped in React's cache() so multiple calls within one request (e.g. a
 * layout guard and the page it wraps) share a single backend call.
 */
export const getSession = cache(async (): Promise<VoicesSessionUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return (payload?.user as VoicesSessionUser | undefined) ?? null;
  } catch (error) {
    // getSession() runs during Server Component render on pages like
    // /join that also try to statically prerender — must let Next's own
    // dynamic-usage bailout through unchanged (see next-control-flow.ts),
    // not swallow it into "no session".
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices session validation failed:", error);
    return null;
  }
});

// Single-flight refresh: the backend rotates the refresh token on every
// use, so concurrent 401s for the SAME session must share one refresh call
// rather than each spending (and invalidating) their own.
//
// Keyed by the refresh token itself, not a single module-level flag: this
// module is shared across every concurrent request a Node.js server
// process handles, so a bare `let` here would let one visitor's in-flight
// refresh get reused for a completely different visitor's session.
const refreshInFlightByToken = new Map<string, Promise<AuthTokens | null>>();

/** Exported for the /api/auth/refresh route handler — see requireSession() below. */
export async function refreshTokens(): Promise<AuthTokens | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  let inFlight = refreshInFlightByToken.get(refreshToken);

  if (!inFlight) {
    inFlight = (async () => {
      try {
        const response = await fetch(
          `${VOICES_MEMBERSHIP_API_BASE_URL}/api/auth/refresh`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${refreshToken}` },
            cache: "no-store",
          },
        );

        if (!response.ok) return null;

        const payload = await response.json();
        if (!payload?.token || !payload?.refreshToken) return null;

        return { token: payload.token, refreshToken: payload.refreshToken };
      } catch (error) {
        if (isNextControlFlowError(error)) throw error;
        console.error("Voices token refresh failed:", error);
        return null;
      } finally {
        refreshInFlightByToken.delete(refreshToken);
      }
    })();

    refreshInFlightByToken.set(refreshToken, inFlight);
  }

  return inFlight;
}

/**
 * Authenticated fetch for Route Handlers / Server Actions. Attaches the
 * access token; on a 401 it performs a single refresh (rotating cookies)
 * and retries once. Clears cookies if the refresh token is also dead.
 */
export async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();

  const doFetch = (accessToken: string | undefined) =>
    fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });

  let response = await doFetch(token);

  if (response.status === 401) {
    const refreshed = await refreshTokens();

    if (!refreshed) {
      await clearSessionCookies();
      return response;
    }

    await setSessionCookies(refreshed);
    response = await doFetch(refreshed.token);
  }

  return response;
}

/**
 * Server Component guard for the whole /account area and any page that
 * requires a signed-in member. Unlike getSession(), this survives past the
 * 1-hour access-token lifetime for as long as the 30-day refresh token is
 * valid — without it, a member would be bounced to /sign-in every hour.
 *
 * getSession() can't refresh itself: refreshing mutates cookies, and
 * Next.js only allows cookie mutation from Route Handlers / Server Actions,
 * never from Server Component render. So when the access token is missing
 * but a refresh token exists, this redirects through /api/auth/refresh (a
 * Route Handler) to perform the refresh, then redirects back to `nextPath`.
 * That handler reuses the same single-flight refreshTokens() above, so it
 * doesn't reintroduce the refresh-token-rotation race this module already
 * guards against.
 */
export async function requireSession(
  nextPath: string,
): Promise<VoicesSessionUser> {
  const user = await getSession();
  if (user) return user;

  const refreshToken = await getRefreshToken();
  const safePath = safeInternalPath(nextPath, "/account");

  if (refreshToken) {
    redirect(`/api/auth/refresh?next=${encodeURIComponent(safePath)}`);
  }

  redirect(`/sign-in?next=${encodeURIComponent(safePath)}`);
}
