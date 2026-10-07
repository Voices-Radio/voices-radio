import "server-only";
import { headers } from "next/headers";

/**
 * The URL a verification email should open: this site's /verify-email page,
 * carrying where to go once the member is signed in.
 *
 * Built from the request's own host rather than a configured site URL, so the
 * link follows whichever deployment the visitor signed up on — staging
 * testers come back to staging, live members to the live site — with nothing
 * to switch at go-live. The host header is not trusted on its own: the
 * backend only uses this URL if its origin is on an allowlist, and otherwise
 * falls back to its default link.
 */
export async function verificationReturnUrl(
  nextPath: string,
): Promise<string | undefined> {
  const store = await headers();
  // Proxies may append to these; the first entry is the client-facing one.
  const first = (value: string | null) => value?.split(",")[0]?.trim() || null;

  const host = first(store.get("x-forwarded-host")) ?? first(store.get("host"));
  if (!host) return undefined;

  const proto =
    first(store.get("x-forwarded-proto")) ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}/verify-email?next=${encodeURIComponent(nextPath)}`;
}
