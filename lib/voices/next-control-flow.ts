/**
 * Next.js signals its own internal control flow — redirect(), notFound(),
 * and, critically for data-fetching helpers that run during Server
 * Component render, a static-generation "dynamic usage" bailout — by
 * throwing an Error with a string `digest` property. Every broad
 * try/catch around a fetch call in this codebase's membership layer runs
 * during render, so it must let these through unchanged: catching a
 * dynamic-usage bailout and returning a normal value instead would defeat
 * the exact mechanism Next uses to decide a page needs dynamic rendering,
 * silently letting it get prerendered once at build time with stale data.
 */
export function isNextControlFlowError(
  error: unknown,
): error is Error & { digest: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string"
  );
}
