"use client";

import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import { useArchivePlayer } from "./archive-player-context";

function formatDuration(seconds?: number) {
  if (!seconds) return null;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

/**
 * The show page's single primary action.
 *
 * This used to be a bordered card carrying a "{provider} archive" eyebrow, the
 * media title and a "Paused in the MiniPlayer" status line — all of which the
 * mini player already says, one screen further down. Restating the provider and
 * the transport state here was the source of the duplicated "Mixcloud Archive"
 * on the show page, so the panel is now just the button: one control, sharing
 * state with the mini player through ArchivePlayerContext.
 */
export default function ArchivePlayPanel({
  media,
  className,
}: {
  media?: VoicesArchiveMedia;
  className?: string;
}) {
  const { error, isActiveArchive, playArchive, status, toggleArchive } =
    useArchivePlayer();
  const active = isActiveArchive(media);
  const playing = active && (status === "playing" || status === "loading");
  const unavailable = !media;
  const duration = formatDuration(media?.duration);

  const label = unavailable
    ? "Archive unavailable"
    : playing
      ? "Pause"
      : active
        ? "Resume"
        : duration
          ? `Listen back · ${duration}`
          : "Listen back";

  function handleClick() {
    if (!media) return;

    if (active) {
      toggleArchive();
      return;
    }

    playArchive(media);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={unavailable}
        className={cn(
          "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-voicesNext-orangeButton px-6 font-gabarito text-base font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background disabled:cursor-not-allowed disabled:bg-transparent disabled:text-voicesNext-secondary disabled:ring-1 disabled:ring-inset disabled:ring-voicesNext-border",
          playing && "bg-voicesNext-cream text-voicesNext-background",
        )}
        aria-label={
          media
            ? `${playing ? "Pause" : active ? "Resume" : "Listen back"} ${media.title}`
            : "Archive unavailable"
        }
      >
        {playing ? (
          <Pause aria-hidden="true" size={18} fill="currentColor" />
        ) : (
          <Play aria-hidden="true" size={18} fill="currentColor" />
        )}
        {label}
      </button>

      {unavailable && (
        <p className="font-asap text-sm text-voicesNext-secondary">
          No archive available for this show yet.
        </p>
      )}

      {active && status === "error" && error && (
        <p className="font-asap text-sm text-voicesNext-orangeText" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
