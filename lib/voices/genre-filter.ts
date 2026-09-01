/**
 * Pure helpers for the URL-driven multi-select genre filter shared by
 * /explore and /artists. Genre selection lives entirely in the `genre`
 * search param (repeated: `?genre=a&genre=b`); these functions produce the
 * next param list and the href to navigate to.
 */

/** Add `key` if absent, remove it if already selected. Order is preserved. */
export function toggleGenre(current: string[], key: string): string[] {
  return current.includes(key)
    ? current.filter((genre) => genre !== key)
    : [...current, key];
}

/** Remove `key` from the selection if present. */
export function removeGenre(current: string[], key: string): string[] {
  return current.filter((genre) => genre !== key);
}

/**
 * Build a path for the given genre selection, preserving any extra params
 * (e.g. `tab`, `category`, `expand`). Genres are emitted in the order given;
 * an empty selection yields `basePath` plus extras only.
 */
export function buildGenreHref(
  basePath: string,
  genres: string[],
  extra?: Record<string, string | undefined>,
): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value != null && value !== "") {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  for (const genre of genres) {
    parts.push(`genre=${encodeURIComponent(genre)}`);
  }

  return parts.length ? `${basePath}?${parts.join("&")}` : basePath;
}
