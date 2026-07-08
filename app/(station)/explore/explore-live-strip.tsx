"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  voicesLiveStations,
  type VoicesLiveStationConfig,
} from "@/lib/voices/config";
import useRadioCultLiveMetadata from "@/hooks/use-radio-cult-live-metadata";
import useStationAudio from "@/hooks/use-station-audio";
import { EastComingSoonStrip } from "../components/redesign/east-coming-soon";

function DiscoveryTabs({ pathname }: { pathname: string }) {
  const activeSection = pathname.startsWith("/artists") ? "artists" : "shows";

  return (
    <nav
      className="flex min-h-[68px] flex-1 items-center px-4 md:px-[60px] lg:px-[70px]"
      aria-label="Explore sections"
    >
      <div className="flex items-center gap-7 font-gabarito text-[20px] font-bold">
        <Link
          href="/explore"
          className={cn(
            "relative",
            activeSection !== "shows" && "text-voicesNext-secondary",
          )}
          aria-current={activeSection === "shows" ? "page" : undefined}
        >
          Shows
          {activeSection === "shows" && (
            <span className="absolute -bottom-[22px] left-0 h-[2px] w-[57px] bg-voicesNext-orange" />
          )}
        </Link>
        <Link
          href="/artists"
          className={cn(
            "relative",
            activeSection !== "artists" && "text-voicesNext-secondary",
          )}
          aria-current={activeSection === "artists" ? "page" : undefined}
        >
          Artists
          {activeSection === "artists" && (
            <span className="absolute -bottom-[22px] left-0 h-[2px] w-[60px] bg-voicesNext-orange" />
          )}
        </Link>
        <span className="text-voicesNext-secondary" aria-disabled="true">
          Series
        </span>
      </div>
    </nav>
  );
}

export default function ExploreLiveStrip() {
  const pathname = usePathname();
  const showDiscoveryTabs = pathname === "/explore" || pathname === "/artists";

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
            {voicesLiveStations.map((station) =>
              station.comingSoon ? (
                <EastComingSoonStrip key={station.id} />
              ) : (
                <ExploreLiveStation key={station.id} station={station} />
              ),
            )}
          </div>
        </div>
        {showDiscoveryTabs && <DiscoveryTabs pathname={pathname} />}
      </div>
    </section>
  );
}

function ExploreLiveStation({ station }: { station: VoicesLiveStationConfig }) {
  const liveMetadata = useRadioCultLiveMetadata(station.id);
  const { audioRef, error, loading, playing, toggle } = useStationAudio(
    station.streamUrl,
  );
  const status = liveMetadata.status === "offAir" ? "OFF AIR" : "ON AIR";

  return (
    <div className="flex h-[34px] border-b border-black last:border-b-0">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      <div className="grid min-w-0 flex-1 grid-cols-[52px_1fr_auto] items-center gap-3 px-2">
        <span className="font-outfit text-[19px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
          {station.label}
        </span>
        <span className="truncate font-outfit text-[13px] leading-none tracking-[1px] text-[#443f3f]">
          {error ? "Stream unavailable" : liveMetadata.title}
        </span>
        <span className="inline-flex items-center gap-2 font-asap text-[10px] uppercase tracking-[1px]">
          {status}
          <span className="size-2 rounded-full bg-voicesNext-live" />
        </span>
      </div>
      <button
        type="button"
        disabled={!station.streamUrl || loading}
        onClick={toggle}
        className={cn(
          "inline-flex h-[34px] w-[35px] shrink-0 items-center justify-center border-l border-black transition-colors hover:bg-voicesNext-background hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange disabled:cursor-not-allowed disabled:text-voicesNext-secondary",
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
}
