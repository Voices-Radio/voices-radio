"use client";

import { ExternalLink, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicesArchiveMedia } from "@/lib/voices/types";
import { useArchivePlayer } from "./archive-player-context";

function providerLabel(provider: "mixcloud" | "soundcloud") {
  return provider === "mixcloud" ? "Mixcloud" : "SoundCloud";
}

export default function ArchivePlayPanel({
  media,
}: {
  media?: VoicesArchiveMedia;
}) {
  const {
    activeMedia,
    error,
    isActiveArchive,
    playArchive,
    status,
    toggleArchive,
  } = useArchivePlayer();
  const active = isActiveArchive(media);
  const playing = active && (status === "playing" || status === "loading");
  const unavailable = !media;
  const label = playing ? "Pause" : active ? "Resume" : "Listen back";
  const provider = media ? providerLabel(media.provider) : "Archive";

  function handleClick() {
    if (!media) return;

    if (activeMedia?.id === media.id) {
      toggleArchive();
      return;
    }

    playArchive(media);
  }

  return (
    <section
      className="overflow-hidden border border-voicesNext-border bg-voicesNext-surface md:rounded-voices-sm"
      aria-label="Archive player"
    >
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <p className="font-asap text-xs font-bold uppercase text-voicesNext-orangeText">
            {provider} archive
          </p>
          <h2 className="mt-1 truncate font-gabarito text-lg font-bold text-voicesNext-cream">
            {media?.title ?? "Archive unavailable"}
          </h2>
          <p className="mt-1 font-asap text-sm text-voicesNext-secondary">
            {unavailable
              ? "This show does not have a playable Mixcloud or SoundCloud archive yet."
              : playing
              ? "Playing in the MiniPlayer"
              : active
              ? "Paused in the MiniPlayer"
              : "Start listening and keep it playing while you browse."}
          </p>
          {active && status === "error" && error && (
            <p className="mt-2 font-asap text-sm text-voicesNext-orangeText">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={unavailable}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface disabled:cursor-not-allowed disabled:bg-voicesNext-border disabled:text-voicesNext-background/70",
              playing && "bg-voicesNext-cream text-voicesNext-background",
            )}
            aria-label={media ? `${label} ${media.title}` : "Archive unavailable"}
          >
            {playing ? (
              <Pause aria-hidden="true" size={16} fill="currentColor" />
            ) : (
              <Play aria-hidden="true" size={16} fill="currentColor" />
            )}
            {label}
          </button>
          {media && (
            <a
              href={media.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-voicesNext-border px-4 font-asap text-xs font-bold uppercase text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface"
            >
              <ExternalLink aria-hidden="true" size={14} />
              Open source
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
