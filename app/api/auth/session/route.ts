import { NextResponse } from "next/server";
import {
  getSession,
  refreshTokens,
  setSessionCookies,
} from "@/lib/voices/membership/session";

// Never cache: this is the header's live source of truth for signed-in
// state, polled client-side because the session cookies are httpOnly.
export const dynamic = "force-dynamic";

/**
 * Client-readable session check. Unlike getSession() alone, this survives
 * past the 1-hour access-token lifetime: a Server Component can't mutate
 * cookies to refresh itself (see session.ts), but a Route Handler can, so
 * this does the same transparent refresh requireSession() does for /account.
 * Without it, the header would flip back to "Sign in" every hour for a
 * member with a perfectly valid 30-day session.
 *
 * Always 200s — signed-out is a normal state for this endpoint, not an
 * error, so callers can treat `user: null` as the only thing to check.
 */
export async function GET() {
  const user = await getSession();
  if (user) return NextResponse.json({ user });

  const refreshed = await refreshTokens();
  if (!refreshed) return NextResponse.json({ user: null });

  await setSessionCookies(refreshed);
  return NextResponse.json({ user: await getSession() });
}
