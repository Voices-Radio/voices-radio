import type { SanityClient } from "sanity";

/**
 * Attaches the current Studio user's Sanity token to a request against our
 * own /api/voices/admin-* routes, which validate it server-side (see
 * lib/voices/studio-auth.ts).
 *
 * The embedded Studio at /studio runs on our own domain, so Sanity uses
 * cookieless auth and the token is available on the client config. If it is
 * ever absent we still send the request: the server answers 401 and the input
 * surfaces that, which is a far better failure than silently sending an
 * unauthenticated request that used to succeed.
 */
export function studioAuthHeaders(
  client: SanityClient,
  extra: Record<string, string> = {},
): Record<string, string> {
  const token = client.config().token;

  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}
