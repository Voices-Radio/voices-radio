/**
 * Shared guard for any redirect target that comes from user input (a `next`
 * query param, a form field, etc). Only ever allow a same-origin, absolute
 * path — never a protocol-relative or off-site URL — so a crafted link
 * can't turn our own redirect into an open redirect.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback: string,
): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : fallback;
}
