/**
 * Pure helpers for the URL-driven multi-select genre filter shared by
 * /explore and /artists. Genre selection lives entirely in the `genre`
 * search param (repeated: `?genre=a&genre=b`); these functions produce the
 * next param list and the href to navigate to.
 *
 * These are thin `genre`-bound wrappers around `param-filter.ts`, which the
 * blog index reuses for `category`.
 */

import {
  buildFilterHref,
  removeValue,
  toggleValue,
} from "./param-filter";

/** Add `key` if absent, remove it if already selected. Order is preserved. */
export function toggleGenre(current: string[], key: string): string[] {
  return toggleValue(current, key);
}

/** Remove `key` from the selection if present. */
export function removeGenre(current: string[], key: string): string[] {
  return removeValue(current, key);
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
  return buildFilterHref(basePath, "genre", genres, extra);
}
