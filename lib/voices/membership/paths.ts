/**
 * Shared guard for any redirect target that comes from user input (a `next`
 * query param, a form field, etc). Only ever allow a same-origin, absolute
 * path — never a protocol-relative or off-site URL — so a crafted link
 * can't turn our own redirect into an open redirect.
 *
 * Resolves the candidate against a throwaway origin and checks the ORIGIN of
 * the result, rather than pattern-matching the raw string. Prefix checks are
 * the wrong tool here: `startsWith("/") && !startsWith("//")` accepts
 * `/\evil.com`, which every browser resolves to `https://evil.com/` because
 * WHATWG URL treats a backslash as a path separator for special schemes.
 * Blocklisting `\` would only move the goalposts to the next normalisation
 * quirk (tabs, newlines, encoded variants). Letting the URL parser decide what
 * the string actually MEANS, then insisting the answer is same-origin, closes
 * the whole class at once — and returns the value already normalised.
 */

const INTERNAL_ORIGIN = "https://internal.invalid";

/**
 * The validation itself. Returns the normalised path, or undefined when the
 * candidate is missing or not same-origin.
 *
 * Two shapes exist because callers genuinely want two different things: a
 * redirect always needs SOME destination (safeInternalPath, below), while the
 * password flows need to distinguish "no next was supplied" from "next was
 * supplied and rejected" so they can omit the param entirely. Both delegate
 * here so there is exactly one implementation of the rule.
 */
export function safeInternalPathOrUndefined(
  next: string | null | undefined,
): string | undefined {
  if (!next) return undefined;

  // Preserve the original contract: callers pass absolute internal paths. A
  // relative value would resolve harmlessly against the origin root, but
  // accepting one silently turns a caller's bug into a working redirect.
  if (!next.startsWith("/")) return undefined;

  try {
    const url = new URL(next, INTERNAL_ORIGIN);

    // Any candidate that resolves elsewhere — an absolute URL, a
    // protocol-relative one, or a backslash trick — is off-site by definition.
    if (url.origin !== INTERNAL_ORIGIN) return undefined;

    // `javascript:` and friends parse without throwing and carry no origin, so
    // the origin check above already rejects them. Belt and braces: a value we
    // hand to a redirect must be a path, so require one.
    if (!url.pathname.startsWith("/")) return undefined;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export function safeInternalPath(
  next: string | null | undefined,
  fallback: string,
): string {
  return safeInternalPathOrUndefined(next) ?? fallback;
}
