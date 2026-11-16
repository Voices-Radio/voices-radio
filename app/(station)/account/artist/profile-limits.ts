/**
 * Limits the artist profile form enforces before it calls the backend. Kept
 * out of actions.ts because a "use server" module may export only async
 * functions. Lengths count UTF-16 code units (`string.length`), the same
 * as zod's `.max()`.
 */
export const BIO_MAX_LENGTH = 2_000;

export function formatCount(count: number): string {
  return count.toLocaleString("en-GB");
}
