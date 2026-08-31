"use client";

import { Pause, Play } from "lucide-react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import { useArchivePlayer } from "./archive-player-context";

/**
 * The play affordance at the bottom-left of ShowCard. When the show has a
 * playable Mixcloud/SoundCloud archive this opens the MiniPlayer straight
 * away instead of navigating into /shows/[id] — the card's stretched Link
 * still handles every other tap. Sits as a sibling of that Link, never
 * nested inside it, and stops its own click from bubbling into the card.
 *
 * With no playable archive it falls back to the original decorative icon,
 * so the whole card (including this corner) keeps routing to the show page.
 */
export default function ArchiveTilePlayButton({
  media,
  title,
}: {
  media?: VoicesArchiveMedia;
  title: string;
}) {
  const { activeMedia, isActiveArchive, playArchive, status, toggleArchive } =
    useArchivePlayer();

  if (!media) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-voicesNext-cream">
        <Play aria-hidden="true" size={15} fill="currentColor" />
      </span>
    );
  }

  const playable = media;
  const active = isActiveArchive(playable);
  const playing = active && (status === "playing" || status === "loading");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (activeMedia?.id === playable.id) {
      toggleArchive();
      return;
    }

    playArchive(playable);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        playing
          ? `Pause ${title}`
          : active
            ? `Resume ${title}`
            : `Play ${title}`
      }
      className={cn(
        // -m-3/p-3 grows the tap target to 44px (WCAG 2.5.5) without
        // shifting the visible icon or the row layout. Named group so this
        // button's own hover drives the icon without colliding with the
        // card's unrelated artwork-scale group-hover.
        "group/play pointer-events-auto relative z-10 -m-3 flex h-11 w-11 items-center justify-center p-3 text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange",
      )}
    >
      {playing ? (
        <Pause
          aria-hidden="true"
          size={15}
          fill="currentColor"
          className="transition-[filter] duration-300 group-hover/play:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)] group-focus-visible/play:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)]"
        />
      ) : (
        <Play
          aria-hidden="true"
          size={15}
          fill="currentColor"
          className="transition-[filter] duration-300 group-hover/play:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)] group-focus-visible/play:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)]"
        />
      )}
    </button>
  );
}
