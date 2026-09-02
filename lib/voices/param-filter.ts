/**
 * Pure helpers for the URL-driven multi-select filters used across the site.
 * Selection lives entirely in a repeated search param (`?genre=a&genre=b`,
 * `?category=news`); these functions produce the next value list and the href
 * to navigate to.
 *
 * `genre-filter.ts` wraps these for /explore and /artists; the blog index
 * wraps them for `category`. Keeping one implementation means both surfaces
 * behave identically — the same chip, the same "×", the same "Clear all".
 */

/** Add `value` if absent, remove it if already selected. Order is preserved. */
export function toggleValue(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
}

/** Remove `value` from the selection if present. */
export function removeValue(current: string[], value: string): string[] {
  return current.filter((entry) => entry !== value);
}

/**
 * Build a path for the given selection, preserving any extra params
 * (e.g. `tab`, `expand`). Values are emitted in the order given; an empty
 * selection yields `basePath` plus extras only.
 */
export function buildFilterHref(
  basePath: string,
  key: string,
  values: string[],
  extra?: Record<string, string | undefined>,
): string {
  const parts: string[] = [];

  for (const [extraKey, extraValue] of Object.entries(extra ?? {})) {
    if (extraValue != null && extraValue !== "") {
      parts.push(
        `${encodeURIComponent(extraKey)}=${encodeURIComponent(extraValue)}`,
      );
    }
  }

  for (const value of values) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }

  return parts.length ? `${basePath}?${parts.join("&")}` : basePath;
}
