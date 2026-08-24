import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard focus-visible ring: orange ring, offset onto the page background.
 * Uses `focus-visible:` (not `focus:`) so mouse/pointer clicks never show a
 * ring — only keyboard focus does. Pair with `focus:outline-none` to drop
 * the native outline in both cases.
 */
export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background";

/** Same as {@link focusRing}, offset onto `voicesNext-surface` instead. */
export const focusRingOnSurface =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface";

/** Inset orange ring — for controls with no room for an offset ring. */
export const focusRingInset =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange";
