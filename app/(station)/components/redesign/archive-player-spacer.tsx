"use client";

import { useArchivePlayer } from "./archive-player-context";

/**
 * Reserves the footprint of the fixed ArchiveMiniPlayer at the end of the page.
 *
 * The mini player is position:fixed, so it took no layout space and sat on top
 * of whatever the page ended with — on the show page that was the Become a
 * Supporter block, whose copy and CTA were partly occluded. Rendering a spacer
 * only while a show is loaded keeps pages flush when nothing is playing.
 */
export default function ArchivePlayerSpacer() {
  const { activeMedia } = useArchivePlayer();

  if (!activeMedia) return null;

  // ArchiveMiniPlayer measures itself and publishes --archive-player-height.
  // The fallback covers the first paint, before the observer has reported; the
  // added 16px keeps the footer from sitting flush against the bar.
  return (
    <div
      aria-hidden="true"
      className="h-[calc(var(--archive-player-height,120px)_+_16px)]"
    />
  );
}
