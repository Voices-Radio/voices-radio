"use client";

import { useCallback } from "react";
import type { SanityClient } from "sanity";
import { useWorkspace } from "sanity";

/**
 * Attaches the current Studio user's Sanity token to a request against our
 * own /api/voices/admin-* routes, which validate it server-side (see
 * lib/voices/studio-auth.ts).
 *
 * The token only exists when the Studio runs cookieless. With the default
 * `loginMethod: "dual"` the auth store prefers the api.sanity.io session
 * cookie and deliberately keeps the client tokenless, so every admin-* call
 * answered 401. sanity.config.ts therefore pins `loginMethod: "token"`.
 *
 * A session that was established before that change is still authenticated by
 * cookie and still has no token. Those editors must sign in again, so the
 * inputs surface STUDIO_TOKEN_MISSING_MESSAGE instead of a bare 401.
 */

export const STUDIO_TOKEN_MISSING_MESSAGE =
  "This Studio session has no Sanity API token, so Voices data cannot load. Sign in again to get one.";

function getStorageKey(projectId: string) {
  // Mirrors Sanity's own key, so we read the token the auth store wrote.
  return `__studio_auth_token_${projectId}`;
}

function getStoredToken(projectId?: string) {
  if (!projectId || typeof window === "undefined") return undefined;

  try {
    const item = window.localStorage.getItem(getStorageKey(projectId));
    if (!item) return undefined;

    const { token } = JSON.parse(item) as { token?: unknown };
    return typeof token === "string" && token.length > 0 ? token : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The client's own token when it has one, else the token Sanity stored for
 * this project. The fallback covers a client that was built for cookie auth
 * while a usable token already sits in storage.
 */
export function getStudioToken(client: SanityClient) {
  const { token, projectId } = client.config();

  return token ?? getStoredToken(projectId);
}

export function studioAuthHeaders(
  client: SanityClient,
  extra: Record<string, string> = {},
): Record<string, string> {
  const token = getStudioToken(client);

  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

/**
 * Token for the current session, plus a way to get one when it is missing.
 * Signing out drops the cookie session and returns the editor to the login
 * screen, which now completes cookieless and stores a token.
 */
export function useStudioAuth(client: SanityClient) {
  const { auth } = useWorkspace();
  const logout = auth.logout;

  const signInAgain = useCallback(() => {
    logout?.();
  }, [logout]);

  return {
    token: getStudioToken(client),
    canSignInAgain: Boolean(logout),
    signInAgain,
  };
}
