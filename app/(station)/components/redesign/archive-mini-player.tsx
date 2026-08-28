"use client";

import { ExternalLink, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ArchiveWidgetHost from "./archive-widget-host";
import { useArchivePlayer } from "./archive-player-context";

function formatTime(value?: number) {
  if (!value || Number.isNaN(value)) return "0:00";

  const totalSeconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function providerLabel(provider: "mixcloud" | "soundcloud") {
  return provider === "mixcloud" ? "Mixcloud" : "SoundCloud";
}

export default function ArchiveMiniPlayer() {
  const {
    activeMedia,
    command,
    error,
    progress,
    status,
    setEnded,
    setError,
    setPaused,
    setPlaying,
    setProgress,
    setReady,
    stopArchive,
    toggleArchive,
  } = useArchivePlayer();

  if (!activeMedia) return null;

  const playing = status === "playing" || status === "loading";
  const duration = progress.duration ?? activeMedia.duration;
  const progressPercent =
    duration && progress.position
      ? Math.min(100, Math.max(0, (progress.position / duration) * 100))
      : 0;
  const statusText =
    status === "error"
      ? (error ?? "Archive player unavailable")
      : status === "loading"
        ? "Loading player"
        : status === "playing"
          ? "Playing"
          : status === "paused"
            ? "Paused"
            : status === "ended"
              ? "Ended"
              : "Ready";

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(8px,env(safe-area-inset-bottom))] md:px-4 md:pb-4"
      aria-label="Archive mini player"
    >
      <div className="mx-auto max-w-[1280px] overflow-hidden border border-voicesNext-border bg-voicesNext-background shadow-[0_-16px_40px_rgba(0,0,0,0.38)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(360px,450px)] md:items-stretch">
        <div className="grid min-h-[88px] grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-voicesNext-border bg-voicesNext-surface p-2 md:min-h-[96px] md:border-b-0 md:border-r md:p-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-voices-xs bg-voicesNext-background">
            <Image
              src={activeMedia.artwork.src}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-orangeText">
              {providerLabel(activeMedia.provider)} archive · {statusText}
            </p>
            <h2 className="mt-1 truncate font-gabarito text-[16px] font-bold leading-tight text-voicesNext-cream md:text-[18px]">
              {activeMedia.title}
            </h2>
            <p className="mt-1 truncate font-asap text-[12px] leading-none text-voicesNext-secondary">
              {activeMedia.artistName ?? "Voices Radio"}
            </p>
            <div
              className="bg-voicesNext-border/45 mt-2 h-1 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-voicesNext-orange"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1 font-asap text-[10px] leading-none text-voicesNext-secondary">
              {formatTime(progress.position)}
              {duration ? ` / ${formatTime(duration)}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={activeMedia.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange md:inline-flex"
              aria-label={`Open ${activeMedia.title} on ${providerLabel(
                activeMedia.provider,
              )}`}
            >
              <ExternalLink aria-hidden="true" size={16} />
            </a>
            <button
              type="button"
              onClick={toggleArchive}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-voicesNext-orangeButton text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface",
                playing && "bg-voicesNext-cream text-voicesNext-background",
              )}
              aria-label={playing ? "Pause archive" : "Play archive"}
            >
              {playing ? (
                <Pause aria-hidden="true" size={18} fill="currentColor" />
              ) : (
                <Play aria-hidden="true" size={18} fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              onClick={stopArchive}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface"
              aria-label="Close archive player"
            >
              <X aria-hidden="true" size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="h-[64px] bg-voicesNext-background md:h-[96px]">
          <ArchiveWidgetHost
            media={activeMedia}
            command={command}
            onReady={setReady}
            onPlay={setPlaying}
            onPause={setPaused}
            onEnded={setEnded}
            onError={setError}
            onProgress={setProgress}
          />
        </div>
      </div>
    </section>
  );
}
