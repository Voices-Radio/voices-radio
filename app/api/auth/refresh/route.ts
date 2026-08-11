import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookies,
  getRefreshToken,
  refreshTokens,
  setSessionCookies,
} from "@/lib/voices/membership/session";
import { safeInternalPath } from "@/lib/voices/membership/paths";

/**
 * Route Handler-only step of requireSession()'s refresh flow (see
 * lib/voices/membership/session.ts). Server Components can't mutate
 * cookies, so a Server Component that finds a live refresh token but no
 * access token redirects here to do the refresh, then bounces back to
 * `next`. Never called directly by the UI.
 */
export async function GET(request: NextRequest) {
  const next = safeInternalPath(
    request.nextUrl.searchParams.get("next"),
    "/account",
  );

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.redirect(
      new URL(`/sign-in?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  const refreshed = await refreshTokens();

  if (!refreshed) {
    await clearSessionCookies();
    return NextResponse.redirect(
      new URL(`/sign-in?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  await setSessionCookies(refreshed);
  return NextResponse.redirect(new URL(next, request.url));
}
