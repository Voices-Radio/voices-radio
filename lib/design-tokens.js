/**
 * Colour painted behind the iPhone Dynamic Island / status bar safe area.
 *
 * Kept as a single CJS source so both the build-time Tailwind config and the
 * runtime app code resolve the same value. Referenced from:
 * - tailwind.config.js            → `voicesNext.safeArea` (the solid band in
 *   site-header.tsx behind the Dynamic Island)
 * - app/layout.tsx                → `viewport.themeColor` (tints the Safari
 *   chrome to match)
 * - app/globals.css               → `--voices-mobile-safe-area-background`
 *   (html/body background, revealed on overscroll) — CSS can't import this
 *   module, so that one has to be kept in sync by hand.
 *
 * A mismatch between these is what makes the safe area look "cut off"
 * against the header instead of blending into it.
 */
module.exports = {
  SAFE_AREA_COLOR: "#4b4b4b",
};
