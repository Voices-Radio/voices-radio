/** Query params that carry an interrupted save across sign-up / sign-in. */
export const SAVE_SHOW_PARAM = "save";
export const SAVE_ARTIST_PARAM = "saveArtist";

/**
 * Where a signed-out visitor goes when they tap a save control: the sign-in
 * page, with the page they were on (plus the intended save, encoded as a
 * query param) as `next`. Saving is free, so sign-in offers "Create one
 * here" (a free account) as well as "Join as a member"; both carry `next` on,
 * so the save is replayed afterwards by save-intent-replay.tsx either way.
 */
export function signInHrefForSaveIntent(
  pathname: string,
  search: string,
  param: typeof SAVE_SHOW_PARAM | typeof SAVE_ARTIST_PARAM,
  id: string,
): string {
  const query = new URLSearchParams(search);
  query.set(param, id);
  const next = `${pathname}?${query.toString()}`;
  return `/sign-in?next=${encodeURIComponent(next)}`;
}
