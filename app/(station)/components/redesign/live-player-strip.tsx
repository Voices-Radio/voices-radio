"use client";

import { Pause, Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { voicesLiveStations, type VoicesLiveStationConfig } from "@/lib/voices/config";
import useRadioCultLiveMetadata from "@/hooks/use-radio-cult-live-metadata";
import useStationAudio from "@/hooks/use-station-audio";
import RestreamVideoModal from "./restream-video-modal";

function LiveStationPill({ station }: { station: VoicesLiveStationConfig }) {
  const liveMetadata = useRadioCultLiveMetadata(station.id);
  const { audioRef, error, loading, playing, toggle } = useStationAudio(
    station.streamUrl,
  );

  return (
    <div className="min-h-11 flex min-w-[245px] items-center justify-between gap-3 rounded-full border border-voicesNext-border bg-voicesNext-background px-3 md:min-w-[280px]">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      <div className="min-w-0">
        <p className="font-asap text-xs font-bold uppercase text-voicesNext-orange">
          {station.label}
        </p>
        <p className="truncate font-gabarito text-sm font-bold text-voicesNext-cream">
          {error ? "Stream unavailable" : liveMetadata.title}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={!station.streamUrl || loading}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-voicesNext-orange text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:cursor-not-allowed disabled:bg-voicesNext-border disabled:text-voicesNext-secondary",
          playing && "bg-voicesNext-cream",
        )}
        aria-label={playing ? `Pause ${station.label}` : `Play ${station.label}`}
      >
        {playing ? (
          <Pause aria-hidden="true" size={16} />
        ) : (
          <Play aria-hidden="true" size={16} />
        )}
      </button>
      <RestreamVideoModal
        label={station.label}
        videoUrl={station.videoUrl}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
      >
        <Video aria-hidden="true" size={15} />
      </RestreamVideoModal>
    </div>
  );
}

export default function LivePlayerStrip() {
  return (
    <section
      className="border-b border-voicesNext-border bg-voicesNext-surface"
      aria-label="Live player"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between md:px-8 md:py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-voicesNext-live" />
          <p className="font-asap text-xs font-bold uppercase text-voicesNext-cream md:text-sm">
            Live now
          </p>
          <p className="hidden font-gabarito text-sm text-voicesNext-secondary md:block">
            Radio Cult audio with Restream video for KX and East.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto md:items-center">
          {voicesLiveStations.map((station) => (
            <LiveStationPill key={station.id} station={station} />
          ))}
        </div>
      </div>
    </section>
  );
}
