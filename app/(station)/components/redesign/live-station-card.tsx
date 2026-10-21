"use client";

import { ExternalLink, Radio, Square, Video } from "lucide-react";
import Image from "next/image";
import { useState, type RefObject } from "react";
import Spinner from "@/icons/spinner";
import { cn } from "@/lib/utils";
import type { VoicesLiveStationId } from "@/lib/voices/config";
import useRadioCultLiveMetadata from "@/hooks/use-radio-cult-live-metadata";
import { isSafeRestreamUrl } from "./restream-video-modal";

// Shared by both KX actions. The pair swaps colours together while either is
// hovered or focused. Two colours can't also say *which* button is hovered (the
// default is one of the two states), so the hovered button lifts instead.
// Transitioning only the properties that change keeps it smooth.
const KX_ACTION_CLASS =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 font-gabarito text-xs font-bold transition-[background-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-10 md:gap-2 md:px-5 md:text-sm";

// Handlers live on a wrapper rather than the control: a disabled <button> (while
// connecting) doesn't reliably fire pointer-leave, which would leave the swap
// stuck on.
function hoverHandlers(
  action: "watch" | "listen",
  set: (value: "watch" | "listen" | null) => void,
) {
  return {
    onPointerEnter: () => set(action),
    onPointerLeave: () => set(null),
    onFocusCapture: () => set(action),
    onBlurCapture: () => set(null),
  };
}

const LIFT = "scale-[1.04] shadow-xl";
const FLAT = "scale-100 shadow-lg";

export default function LiveStationCard({
  cardRef,
  stationId,
  station,
  title,
  artwork,
  artworkAlt,
  videoUrl,
  watchLiveUrl,
  canListenLive = false,
  listenPlaying = false,
  listenLoading = false,
  selected,
  onSelect,
  onWatchLive,
  onListenLive,
  className,
}: {
  cardRef: RefObject<HTMLButtonElement>;
  stationId: VoicesLiveStationId;
  station: "KX" | "EAST";
  title: string;
  artwork?: string;
  artworkAlt?: string;
  videoUrl?: string;
  watchLiveUrl?: string;
  canListenLive?: boolean;
  /** KX stream is playing; Listen live then acts as stop. */
  listenPlaying?: boolean;
  /** KX stream is connecting. */
  listenLoading?: boolean;
  selected: boolean;
  onSelect: () => void;
  onWatchLive: () => void;
  onListenLive: () => void;
  className?: string;
}) {
  const liveMetadata = useRadioCultLiveMetadata(stationId);
  const [mouseHovering, setMouseHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // Which KX action the pointer or keyboard focus is on, if any.
  const [hoveredAction, setHoveredAction] = useState<"watch" | "listen" | null>(
    null,
  );
  const actionsSwapped = hoveredAction !== null;
  const displayTitle = liveMetadata.title || title;
  // The on-air artist's photo when the live feed has one, else the station image.
  const displayArtwork = liveMetadata.artwork
    ? { src: liveMetadata.artwork, alt: `${displayTitle} artist photo` }
    : {
        src: artwork ?? "/VOICESLOGO_LIGHTBOX.png",
        alt: artworkAlt ?? `${station} live show artwork`,
      };
  const videoAvailable = isSafeRestreamUrl(videoUrl);
  // Only the artwork greys, and only while the stream plays.
  const artworkGrey =
    station === "KX" ? listenPlaying : selected || !videoAvailable;
  const showKxLiveActions =
    station === "KX" && (selected || mouseHovering || focusWithin);
  const showWatchLive =
    station !== "KX" &&
    videoAvailable &&
    (selected || mouseHovering || focusWithin);
  const cardInteractive = station === "KX" || videoAvailable;

  return (
    <article
      className={cn(
        "group relative h-[126px] overflow-hidden border border-voicesNext-cream bg-voicesNext-background md:h-[316px] md:border-0",
        !cardInteractive && "cursor-not-allowed",
        className,
      )}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setMouseHovering(true);
      }}
      onPointerLeave={() => setMouseHovering(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
    >
      <div>
        <div className="hidden h-[34px] items-center justify-between bg-voicesNext-cream px-[14px] text-voicesNext-background md:flex">
          <span className="font-outfit text-[24px] font-black uppercase leading-none tracking-[1px]">
            {station}
          </span>
          {station !== "KX" && (
            <Video
              aria-hidden="true"
              className={cn(!cardInteractive && "opacity-40")}
              size={26}
              strokeWidth={2.6}
            />
          )}
        </div>

        <div className="hidden h-[13px] overflow-hidden border-y border-voicesNext-cream bg-voicesNext-background font-outfit text-[10px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-secondary md:block">
          <div className="voices-on-air-marquee flex w-max items-center gap-[6px] px-1">
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="flex shrink-0 items-center gap-[6px]"
              >
                <span>On air</span>
                <span className="h-2 w-2 rounded-full bg-voicesNext-live" />
              </span>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "relative h-[126px] transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[269px]",
            artworkGrey && "grayscale",
          )}
        >
          <Image
            src={displayArtwork.src}
            alt={displayArtwork.alt}
            fill
            sizes="(min-width: 768px) 316px, 50vw"
            className="object-cover"
            priority={station === "KX"}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[57%] to-voicesNext-background/60" />
          <div
            aria-hidden="true"
            className={cn(
              "bg-[#8d8d8d]/55 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              artworkGrey && "opacity-100",
            )}
          />
          <h2 className="absolute bottom-2 left-2 right-3 line-clamp-2 font-gabarito text-[16px] font-bold leading-[1.08] text-voicesNext-cream md:bottom-3 md:left-[10px] md:right-6 md:text-[20px]">
            {displayTitle}
          </h2>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "bg-[#8d8d8d]/55 pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          !cardInteractive && "opacity-45",
        )}
      />
      <button
        ref={cardRef}
        type="button"
        disabled={!cardInteractive}
        onClick={onSelect}
        className="absolute inset-0 z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange disabled:cursor-not-allowed"
        aria-label={
          cardInteractive
            ? `Show ${station} live actions`
            : `${station} live actions unavailable`
        }
        aria-pressed={selected}
      />
      {station === "KX" && (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-30 flex w-[150px] -translate-x-1/2 translate-y-2 flex-col gap-2 opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:w-[210px]",
            showKxLiveActions &&
              "pointer-events-auto -translate-y-1/2 opacity-100",
          )}
        >
          <div {...hoverHandlers("watch", setHoveredAction)} className="flex">
            <a
              href={watchLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={showKxLiveActions ? 0 : -1}
              className={cn(
                KX_ACTION_CLASS,
                "w-full",
                hoveredAction === "watch" ? LIFT : FLAT,
                actionsSwapped
                  ? "bg-voicesNext-orange text-voicesNext-cream"
                  : "bg-voicesNext-cream text-voicesNext-background",
              )}
              aria-label="Watch Voices live on Mixcloud"
            >
              <ExternalLink aria-hidden="true" size={15} strokeWidth={2.6} />
              Watch live
            </a>
          </div>
          <div {...hoverHandlers("listen", setHoveredAction)} className="flex">
            <button
              type="button"
              disabled={!canListenLive || listenLoading}
              aria-busy={listenLoading || undefined}
              tabIndex={showKxLiveActions ? 0 : -1}
              onClick={onListenLive}
              className={cn(
                KX_ACTION_CLASS,
                "w-full disabled:cursor-not-allowed disabled:bg-voicesNext-border disabled:text-voicesNext-secondary",
                hoveredAction === "listen" ? LIFT : FLAT,
                actionsSwapped
                  ? "bg-voicesNext-cream text-voicesNext-background"
                  : "bg-voicesNext-orange text-voicesNext-cream",
              )}
              aria-label={
                listenLoading
                  ? "Connecting to Voices KX live"
                  : listenPlaying
                    ? "Stop Voices KX live"
                    : "Listen to Voices KX live"
              }
            >
              {listenLoading ? (
                <Spinner className="h-[15px] w-[15px]" />
              ) : listenPlaying ? (
                <Square
                  aria-hidden="true"
                  size={13}
                  strokeWidth={2.6}
                  fill="currentColor"
                />
              ) : (
                <Radio aria-hidden="true" size={15} strokeWidth={2.6} />
              )}
              {listenPlaying ? "Stop" : "Listen live"}
            </button>
          </div>
        </div>
      )}
      {station !== "KX" && (
        <button
          type="button"
          disabled={!showWatchLive}
          onClick={onWatchLive}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-30 inline-flex -translate-x-1/2 translate-y-2 items-center justify-center rounded-full bg-voicesNext-cream px-5 py-2 font-gabarito text-sm font-bold text-voicesNext-background opacity-0 shadow-lg transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
            showWatchLive && "pointer-events-auto -translate-y-1/2 opacity-100",
          )}
          aria-label={`Watch ${station} live video`}
        >
          Watch live
        </button>
      )}
    </article>
  );
}
