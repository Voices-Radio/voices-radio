"use client";

import { ExternalLink, Radio, Video } from "lucide-react";
import Image from "next/image";
import { useState, type RefObject } from "react";
import { cn } from "@/lib/utils";
import type { VoicesLiveStationId } from "@/lib/voices/config";
import useRadioCultLiveMetadata from "@/hooks/use-radio-cult-live-metadata";
import { isSafeRestreamUrl } from "./restream-video-modal";

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
  selected: boolean;
  onSelect: () => void;
  onWatchLive: () => void;
  onListenLive: () => void;
  className?: string;
}) {
  const liveMetadata = useRadioCultLiveMetadata(stationId);
  const [mouseHovering, setMouseHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const displayTitle = liveMetadata.title || title;
  const videoAvailable = isSafeRestreamUrl(videoUrl);
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
      <div
        className={cn(
          "transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          (selected || (!videoAvailable && station !== "KX")) && "grayscale",
        )}
      >
        <div className="hidden h-[34px] items-center justify-between bg-voicesNext-cream px-[14px] text-voicesNext-background md:flex">
          <span className="font-outfit text-[24px] font-black uppercase leading-none tracking-[1px]">
            {station}
          </span>
          <Video
            aria-hidden="true"
            className={cn(!cardInteractive && "opacity-40")}
            size={26}
            strokeWidth={2.6}
          />
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

        <div className="relative h-[126px] md:h-[269px]">
          <Image
            src={artwork ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artworkAlt ?? `${station} live show artwork`}
            fill
            sizes="(min-width: 768px) 316px, 50vw"
            className="object-cover"
            priority={station === "KX"}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[57%] to-voicesNext-background/60" />
          <h2 className="absolute bottom-2 left-2 right-3 line-clamp-2 font-gabarito text-[16px] font-bold leading-[1.08] text-voicesNext-cream md:bottom-3 md:left-[10px] md:right-6 md:text-[20px]">
            {displayTitle}
          </h2>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "bg-[#8d8d8d]/55 pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          selected && "opacity-100",
          !cardInteractive && "opacity-45",
        )}
      />
      <button
        ref={cardRef}
        type="button"
        disabled={!cardInteractive}
        onClick={onSelect}
        className="absolute inset-0 z-20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange disabled:cursor-not-allowed"
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
            "pointer-events-none absolute left-1/2 top-1/2 z-30 hidden w-[210px] -translate-x-1/2 translate-y-2 flex-col gap-2 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
            showKxLiveActions &&
              "pointer-events-auto -translate-y-1/2 opacity-100",
          )}
        >
          <a
            href={watchLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={showKxLiveActions ? 0 : -1}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-voicesNext-cream px-5 font-gabarito text-sm font-bold text-voicesNext-background shadow-lg transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            aria-label="Watch Voices live on Mixcloud"
          >
            <ExternalLink aria-hidden="true" size={15} strokeWidth={2.6} />
            Watch live
          </a>
          <button
            type="button"
            disabled={!canListenLive}
            tabIndex={showKxLiveActions ? 0 : -1}
            onClick={onListenLive}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-voicesNext-orange px-5 font-gabarito text-sm font-bold text-voicesNext-cream shadow-lg transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:cursor-not-allowed disabled:bg-voicesNext-border disabled:text-voicesNext-secondary"
            aria-label="Listen to Voices KX live"
          >
            <Radio aria-hidden="true" size={15} strokeWidth={2.6} />
            Listen live
          </button>
        </div>
      )}
      <button
        type="button"
        disabled={!showWatchLive}
        onClick={onWatchLive}
        className={cn(
          "absolute left-1/2 top-1/2 z-30 inline-flex -translate-x-1/2 translate-y-2 items-center justify-center rounded-full bg-voicesNext-cream px-5 py-2 font-gabarito text-sm font-bold text-voicesNext-background opacity-0 shadow-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
          showWatchLive && "pointer-events-auto -translate-y-1/2 opacity-100",
        )}
        aria-label={`Watch ${station} live video`}
      >
        Watch live
      </button>
    </article>
  );
}
