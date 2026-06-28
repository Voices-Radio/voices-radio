"use client";

import { Pause, Play, Video } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { voicesMediaConfig } from "@/lib/voices/config";

type Station = {
  id: "kx" | "east";
  label: "KX" | "EAST";
  title: string;
  streamUrl?: string;
  videoUrl?: string;
};

const stations: Station[] = [
  {
    id: "kx",
    label: "KX",
    title: "Live from Voices KX",
    streamUrl: voicesMediaConfig.radioCult.kxStreamUrl,
    videoUrl: voicesMediaConfig.restream.kxEmbedUrl,
  },
  {
    id: "east",
    label: "EAST",
    title: "Live from Voices East",
    streamUrl: voicesMediaConfig.radioCult.eastStreamUrl,
    videoUrl: voicesMediaConfig.restream.eastEmbedUrl,
  },
];

export default function LivePlayerStrip() {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [errorStation, setErrorStation] = useState<string | null>(null);

  async function toggleStation(station: Station) {
    const audio = audioRefs.current[station.id];
    if (!audio || !station.streamUrl) return;

    try {
      setErrorStation(null);

      if (activeStation === station.id) {
        audio.pause();
        setActiveStation(null);
        return;
      }

      for (const [id, item] of Object.entries(audioRefs.current)) {
        if (id !== station.id) item?.pause();
      }

      await audio.play();
      setActiveStation(station.id);
    } catch {
      setActiveStation(null);
      setErrorStation(station.id);
    }
  }

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
            RadioCult audio and Restream video config are wired as placeholders.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto md:items-center">
          {stations.map((station) => {
            const playing = activeStation === station.id;
            const hasError = errorStation === station.id;

            return (
              <div
                key={station.id}
                className="min-h-11 flex min-w-[245px] items-center justify-between gap-3 rounded-full border border-voicesNext-border bg-voicesNext-background px-3 md:min-w-[280px]"
              >
                <audio
                  ref={(node) => {
                    audioRefs.current[station.id] = node;
                  }}
                  src={station.streamUrl}
                  preload="none"
                />
                <div className="min-w-0">
                  <p className="font-asap text-xs font-bold uppercase text-voicesNext-orange">
                    {station.label}
                  </p>
                  <p className="truncate font-gabarito text-sm font-bold text-voicesNext-cream">
                    {hasError ? "Stream unavailable" : station.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStation(station)}
                  disabled={!station.streamUrl}
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-voicesNext-orange text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:cursor-not-allowed disabled:bg-voicesNext-border disabled:text-voicesNext-secondary",
                    playing && "bg-voicesNext-cream",
                  )}
                  aria-label={
                    playing ? `Pause ${station.label}` : `Play ${station.label}`
                  }
                >
                  {playing ? (
                    <Pause aria-hidden="true" size={16} />
                  ) : (
                    <Play aria-hidden="true" size={16} />
                  )}
                </button>
                <a
                  href={station.videoUrl ?? "#video-placeholder"}
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
                    !station.videoUrl &&
                      "pointer-events-none text-voicesNext-secondary",
                  )}
                  aria-disabled={!station.videoUrl}
                  aria-label={`${station.label} video`}
                >
                  <Video aria-hidden="true" size={15} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
