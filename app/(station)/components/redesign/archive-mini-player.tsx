"use client";

import { ExternalLink, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatShowDisplayTitle } from "@/lib/voices/show-title";
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

const PLAYER_HEIGHT_VAR = "--archive-player-height";
/**
 * Diameter of the seek thumb in px. Must match the `h-3 w-3` below — which is
 * deliberately not `size-3`: that utility landed in Tailwind 3.4 and this
 * project is on 3.3, so it compiles to nothing and the thumb renders 0x0.
 */
const THUMB_SIZE = 12;

/**
 * Publishes the bar's measured height so ArchivePlayerSpacer can reserve
 * exactly that much room at the end of the page.
 *
 * Measured rather than shared as a constant: the bar's height moves with its
 * own content, the loaded font metrics and the iOS safe-area inset, and a
 * hardcoded number in a second file silently drifts out of sync the next time
 * any of those change — which is how page content ended up under the bar in
 * the first place.
 */
function usePublishedPlayerHeight() {
  const observerRef = useRef<ResizeObserver | null>(null);

  // A callback ref, not useEffect: this component returns null until a show is
  // loaded, so an effect with empty deps would run once against a section that
  // does not exist yet and never re-run when the bar finally mounts.
  return useCallback((node: HTMLElement | null) => {
    const root = document.documentElement;

    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) {
      root.style.removeProperty(PLAYER_HEIGHT_VAR);
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty(
        PLAYER_HEIGHT_VAR,
        `${Math.ceil(entry.target.getBoundingClientRect().height)}px`,
      );
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);
}

export default function ArchiveMiniPlayer() {
  const {
    activeMedia,
    command,
    error,
    isPlaying,
    progress,
    status,
    setEnded,
    setError,
    setPaused,
    setPlaying,
    setProgress,
    setReady,
    seekArchive,
    stopArchive,
    toggleArchive,
  } = useArchivePlayer();
  const sectionRef = usePublishedPlayerHeight();
  // Position held while a drag is in flight, so incoming progress events don't
  // yank the thumb out from under the user's finger mid-scrub.
  const [scrub, setScrub] = useState<number | null>(null);
  const scrubbingRef = useRef(false);

  if (!activeMedia) return null;

  const playing = isPlaying;
  const duration = progress.duration ?? activeMedia.duration;
  const displayPosition = scrub ?? progress.position ?? 0;
  const progressPercent =
    duration && displayPosition
      ? Math.min(100, Math.max(0, (displayPosition / duration) * 100))
      : 0;
  // Pulls the thumb's travel in by half its own width at each end, so it sits
  // fully inside the track at 0% and 100% instead of half outside it.
  const thumbOffset = `calc(${progressPercent}% + ${(THUMB_SIZE * (50 - progressPercent)) / 100}px)`;

  function commitScrub(value: number) {
    scrubbingRef.current = false;
    setScrub(null);
    seekArchive(value);
  }

  function handleScrubChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);

    // Dragging reports continuously; committing every step would flood the
    // widget with postMessage seeks. Keyboard input arrives without a pointer
    // gesture, so it commits straight away.
    if (scrubbingRef.current) {
      setScrub(next);
      return;
    }

    commitScrub(next);
  }

  function handleScrubRelease(event: React.PointerEvent<HTMLInputElement>) {
    if (!scrubbingRef.current) return;
    commitScrub(Number(event.currentTarget.value));
  }
  // The button follows intent, but this line stays honest about the widget: it
  // reads "Loading player" for the whole gap between the tap and the first play
  // event, however the widget describes itself in between. Claiming "Playing"
  // optimistically would lie in exactly the case that matters — a mobile
  // browser refusing the play.
  const statusText =
    status === "error"
      ? (error ?? "Archive player unavailable")
      : status === "playing"
        ? "Playing"
        : playing
          ? "Loading player"
          : status === "paused"
            ? "Paused"
            : status === "ended"
              ? "Ended"
              : "Ready";

  return (
    <section
      ref={sectionRef}
      className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(8px,env(safe-area-inset-bottom))] md:px-4 md:pb-4"
      aria-label="Archive mini player"
    >
      {/* One row at every breakpoint. The provider widget used to occupy a
          second column here, which is what stacked two play buttons on top of
          each other — it is now mounted off-screen by ArchiveWidgetHost. */}
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-background shadow-[0_-16px_40px_rgba(0,0,0,0.38)]">
        <div className="grid min-h-[80px] grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 bg-voicesNext-surface p-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-voices-xs bg-voicesNext-background">
            <Image
              src={activeMedia.artwork.src}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-voicesNext-orangeText">
              {statusText}
            </p>
            <h2 className="mt-1 truncate font-gabarito text-[16px] font-bold leading-tight text-voicesNext-cream md:text-[18px]">
              {formatShowDisplayTitle(activeMedia.title)}
            </h2>
            <p className="mt-1 truncate font-asap text-[12px] leading-none text-voicesNext-secondary">
              {activeMedia.artistName ?? "Voices Radio"}
            </p>
            {/* The provider widget carried the only seek bar; now that it is
                hidden, this one has to do the job. A transparent native range
                input sits over the painted track so the control keeps native
                keyboard, touch and screen-reader behaviour while the visuals
                stay on the system's tokens. */}
            <div className="relative mt-2 flex h-1 items-center">
              <input
                type="range"
                min={0}
                max={duration ?? 0}
                step={1}
                value={displayPosition}
                disabled={!duration}
                onChange={handleScrubChange}
                onPointerDown={() => {
                  scrubbingRef.current = true;
                }}
                onPointerUp={handleScrubRelease}
                onPointerCancel={handleScrubRelease}
                aria-label="Seek"
                aria-valuetext={`${formatTime(displayPosition)} of ${formatTime(duration)}`}
                // Inset stretches the hit area to 24px without thickening the
                // 4px visual track (WCAG 2.2 target size).
                className="peer absolute -inset-y-[10px] inset-x-0 z-10 w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed"
              />
              <div
                aria-hidden="true"
                className="bg-voicesNext-border/45 h-1 w-full overflow-hidden rounded-full transition-colors peer-hover:bg-voicesNext-border/70 peer-focus-visible:ring-2 peer-focus-visible:ring-voicesNext-orange peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-voicesNext-surface"
              >
                <div
                  className="h-full rounded-full bg-voicesNext-orange"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {/* Orange, because at 0% there is no orange fill yet and a cream
                  dot half-clipped on the track's left edge read as nothing at
                  all. The surface-coloured ring keeps it legible once it is
                  sitting on the fill it leads. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-voicesNext-orange ring-2 ring-voicesNext-surface transition-transform peer-hover:scale-110 peer-focus-visible:scale-110 peer-disabled:hidden"
                style={{ left: thumbOffset }}
              />
            </div>
            <p className="mt-2 font-asap text-[10px] leading-none text-voicesNext-secondary">
              {formatTime(displayPosition)}
              {duration ? ` / ${formatTime(duration)}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={activeMedia.externalUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                // Provider naming survives here and nowhere else: this names a
                // destination, not a status. Normally desktop-only to keep the
                // mobile row uncrowded — but it is the recovery path when the
                // embedded widget fails, so it appears on mobile in that state.
                "hidden h-10 w-10 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange md:inline-flex",
                status === "error" && "inline-flex",
              )}
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
    </section>
  );
}
