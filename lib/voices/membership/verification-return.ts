import "server-only";
import { headers } from "next/headers";

/**
 * Pages that an emailed link should open on THIS site.
 *
 * Built from the request's own host rather than a configured site URL, so the
 * link follows whichever deployment the visitor is on — staging testers come
 * back to staging, live members to the live site — with nothing to switch at
 * go-live. The host header is not trusted on its own: the backend only uses
 * these URLs if their origin is on an allowlist, and otherwise falls back to
 * its default link.
 */
async function requestOrigin(): Promise<string | undefined> {
  const store = await headers();
  // Proxies may append to these; the first entry is the client-facing one.
  const first = (value: string | null) => value?.split(",")[0]?.trim() || null;

  const host = first(store.get("x-forwarded-host")) ?? first(store.get("host"));
  if (!host) return undefined;

  const proto =
    first(store.get("x-forwarded-proto")) ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

/** This site's /verify-email page, carrying where to go once signed in. */
export async function verificationReturnUrl(
  nextPath: string,
): Promise<string | undefined> {
  const origin = await requestOrigin();
  if (!origin) return undefined;
  return `${origin}/verify-email?next=${encodeURIComponent(nextPath)}`;
}

/**
 * This site's /reset-password page. Without it the backend's reset link
 * opened the auth site, so a member finished on a different site from the
 * one they asked on (found by the staging E2E run, 29 Oct 2026).
 */
export async function resetPasswordReturnUrl(
  nextPath?: string,
): Promise<string | undefined> {
  const origin = await requestOrigin();
  if (!origin) return undefined;
  const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
  return `${origin}/reset-password${query}`;
}
