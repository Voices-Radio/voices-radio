/**
 * Pure helpers for the URL-driven multi-select genre filter shared by
 * /explore and /artists. Genre selection lives entirely in the `genre`
 * search param (repeated: `?genre=a&genre=b`); these functions produce the
 * next param list and the href to navigate to.
 *
 * These are thin `genre`-bound wrappers around `param-filter.ts`, which the
 * blog index reuses for `category`.
 */

import { isGenreKey } from "./genre-taxonomy";
import {
  buildFilterHref,
  removeValue,
  toggleValue,
} from "./param-filter";

/**
 * Most genres one URL can select. Filters combine with AND, so more than this
 * rarely matches a show, and an unbounded list let crawlers request every
 * combination — each an uncached render plus a backend query (14–16 Nov 2026).
 */
export const MAX_SELECTED_GENRES = 3;

/**
 * Add `key` if absent, remove it if already selected. Order is preserved.
 * Adding past MAX_SELECTED_GENRES drops the oldest selection.
 */
export function toggleGenre(current: string[], key: string): string[] {
  return toggleValue(current, key).slice(-MAX_SELECTED_GENRES);
}

/**
 * The genre selection a URL may ask for: known genres only, no repeats, at
 * most MAX_SELECTED_GENRES, in the order given.
 */
export function parseSelectedGenres(values: string[]): string[] {
  return [...new Set(values.filter(isGenreKey))].slice(0, MAX_SELECTED_GENRES);
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
