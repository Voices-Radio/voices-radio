"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { voicesMediaConfig } from "@/lib/voices/config";

type LiveStation = {
  id: "kx" | "east";
  label: "KX" | "EAST";
  title: string;
  status: "ON AIR" | "REPLAY";
  streamUrl?: string;
};

const stations: LiveStation[] = [
  {
    id: "kx",
    label: "KX",
    title: "Breakfast Show",
    status: "ON AIR",
    streamUrl: voicesMediaConfig.radioCult.kxStreamUrl,
  },
  {
    id: "east",
    label: "EAST",
    title: "DJ Mongoose",
    status: "REPLAY",
    streamUrl: voicesMediaConfig.radioCult.eastStreamUrl,
  },
];

function DiscoveryTabs() {
  return (
    <nav
      className="flex min-h-[68px] flex-1 items-center px-4 md:px-[60px] lg:px-[70px]"
      aria-label="Explore sections"
    >
      <div className="flex items-center gap-7 font-gabarito text-[20px] font-bold">
        <Link href="/explore" className="relative">
          Shows
          <span className="absolute -bottom-[22px] left-0 h-[2px] w-[57px] bg-voicesNext-orange" />
        </Link>
        <Link href="/artists" className="text-voicesNext-secondary">
          Artists
        </Link>
        <span className="text-voicesNext-secondary" aria-disabled="true">
          Series
        </span>
      </div>
    </nav>
  );
}

export default function ExploreLiveStrip() {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [errorStation, setErrorStation] = useState<string | null>(null);

  async function toggleStation(station: LiveStation) {
    const audio = audioRefs.current[station.id];
    if (!audio || !station.streamUrl) return;

    try {
      setErrorStation(null);

      if (activeStation === station.id) {
        audio.pause();
        setActiveStation(null);
        return;
      }

      Object.entries(audioRefs.current).forEach(([id, item]) => {
        if (id !== station.id) item?.pause();
      });

      await audio.play();
      setActiveStation(station.id);
    } catch {
      setActiveStation(null);
      setErrorStation(station.id);
    }
  }

  return (
    <section
      className="border-y border-black bg-voicesNext-cream text-voicesNext-background"
      aria-label="Live player"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col md:h-[68px] md:flex-row">
        <div className="flex border-b border-black md:border-b-0 md:border-r">
          <div className="flex w-[70px] shrink-0 items-center justify-center border-r border-black px-2">
            <p className="font-outfit text-[15px] font-black uppercase tracking-[1px]">
              Live
            </p>
          </div>
          <div className="w-full md:w-[350px]">
            {stations.map((station) => {
              const playing = activeStation === station.id;
              const hasError = errorStation === station.id;

              return (
                <div
                  key={station.id}
                  className="flex h-[34px] border-b border-black last:border-b-0"
                >
                  <audio
                    ref={(node) => {
                      audioRefs.current[station.id] = node;
                    }}
                    src={station.streamUrl}
                    preload="none"
                  />
                  <div className="grid min-w-0 flex-1 grid-cols-[52px_1fr_auto] items-center gap-3 px-2">
                    <span className="font-outfit text-[19px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
                      {station.label}
                    </span>
                    <span className="truncate font-outfit text-[13px] leading-none tracking-[1px] text-[#443f3f]">
                      {hasError ? "Stream unavailable" : station.title}
                    </span>
                    <span className="inline-flex items-center gap-2 font-asap text-[10px] uppercase tracking-[1px]">
                      {station.status}
                      <span className="size-2 rounded-full bg-voicesNext-live" />
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!station.streamUrl}
                    onClick={() => toggleStation(station)}
                    className={cn(
                      "inline-flex h-[34px] w-[35px] shrink-0 items-center justify-center border-l border-black transition-colors hover:bg-voicesNext-background hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-inset disabled:cursor-not-allowed disabled:text-voicesNext-secondary",
                      playing && "bg-voicesNext-background text-voicesNext-cream",
                    )}
                    aria-label={
                      playing ? `Pause ${station.label}` : `Play ${station.label}`
                    }
                  >
                    {playing ? (
                      <Pause aria-hidden="true" size={14} fill="currentColor" />
                    ) : (
                      <Play aria-hidden="true" size={14} fill="currentColor" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <DiscoveryTabs />
      </div>
    </section>
  );
}
