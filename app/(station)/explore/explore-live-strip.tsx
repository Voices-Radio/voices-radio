"use client";

import { Play, Search, Square, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getVoicesHeaderPlayerId,
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

function MobileDiscoveryNav({ pathname }: { pathname: string }) {
  const activeSection = pathname.startsWith("/artists") ? "hosts" : "discover";

  return (
    <div className="bg-voicesNext-background px-[10px] pb-8 pt-2 md:hidden">
      <nav
        className="relative flex h-[60px] items-center gap-[22px] px-4 font-gabarito text-[18px] font-bold"
        aria-label="Explore sections"
      >
        <Link
          href="/explore"
          className={cn(
            "relative",
            activeSection !== "discover" && "text-voicesNext-secondary",
          )}
          aria-current={activeSection === "discover" ? "page" : undefined}
        >
          Discover
          {activeSection === "discover" && (
            <span className="absolute -bottom-[13px] left-0 h-[2px] w-full bg-voicesNext-orange" />
          )}
        </Link>
        <Link
          href="/artists"
          className={cn(
            "relative",
            activeSection !== "hosts" && "text-voicesNext-secondary",
          )}
          aria-current={activeSection === "hosts" ? "page" : undefined}
        >
          Hosts
          {activeSection === "hosts" && (
            <span className="absolute -bottom-[13px] left-0 h-[2px] w-full bg-voicesNext-orange" />
          )}
        </Link>
        <span className="text-voicesNext-secondary" aria-disabled="true">
          Series
        </span>
      </nav>
      <form action="/explore" className="px-[10px]" role="search">
        <label htmlFor="mobile-discover-search" className="sr-only">
          Search hosts, shows, genres
        </label>
        <div className="flex h-11 w-full items-center gap-3 rounded-full border border-voicesNext-cream px-4">
          <Search aria-hidden="true" size={14} strokeWidth={2.2} />
          <input
            id="mobile-discover-search"
            name="search"
            type="search"
            placeholder="Search hosts, shows, genres..."
            className="min-w-0 flex-1 bg-transparent font-asap text-[14px] text-voicesNext-cream outline-none placeholder:text-voicesNext-secondary"
          />
        </div>
      </form>
    </div>
  );
}

function MobileStationControl({
  station,
  align = "left",
}: {
  station: VoicesLiveStationConfig;
  align?: "left" | "right";
}) {
  const liveMetadata = useRadioCultLiveMetadata(station.id);
  const { audioRef, loading, playing, toggle } = useStationAudio(
    station.streamUrl,
  );
  const disabled = !station.streamUrl || loading || station.comingSoon;

  return (
    <div className="flex h-7 min-w-0 flex-1 items-center justify-between overflow-hidden bg-voicesNext-cream px-1 text-voicesNext-background">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      {align === "right" && (
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          className="disabled:opacity-45 inline-flex h-7 w-7 shrink-0 items-center justify-center"
          aria-label={
            playing ? `Pause ${station.label}` : `Play ${station.label}`
          }
        >
          {playing ? (
            <Square aria-hidden="true" size={12} fill="currentColor" />
          ) : (
            <Play aria-hidden="true" size={14} fill="currentColor" />
          )}
        </button>
      )}
      <span
        className={cn(
          "min-w-0 truncate font-outfit text-[20px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]",
          align === "right" && "ml-auto",
        )}
        title={liveMetadata.title || station.title}
      >
        {station.label}
      </span>
      {align === "left" && (
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          className="disabled:opacity-45 inline-flex h-7 w-7 shrink-0 items-center justify-center"
          aria-label={
            playing ? `Pause ${station.label}` : `Play ${station.label}`
          }
        >
          {playing ? (
            <Square aria-hidden="true" size={12} fill="currentColor" />
          ) : station.videoUrl ? (
            <Video aria-hidden="true" size={17} strokeWidth={2.2} />
          ) : (
            <Play aria-hidden="true" size={14} fill="currentColor" />
          )}
        </button>
      )}
    </div>
  );
}

function MobileLiveControls() {
  const [kxStation, eastStation] = voicesLiveStations;

  if (!kxStation || !eastStation) return null;

  return (
    <div
      className="flex h-7 divide-x divide-voicesNext-background md:hidden"
      aria-label="Mobile live controls"
    >
      <MobileStationControl station={kxStation} />
      <MobileStationControl station={eastStation} align="right" />
    </div>
  );
}

export default function ExploreLiveStrip() {
  const pathname = usePathname();
  const showDiscoveryTabs = pathname === "/explore" || pathname === "/artists";

  return (
    <section aria-label="Live player">
      <MobileLiveControls />
      {showDiscoveryTabs && <MobileDiscoveryNav pathname={pathname} />}
      <div className="hidden w-full flex-col border-y border-black bg-voicesNext-cream text-voicesNext-background md:flex md:h-[68px] md:flex-row">
        <div className="flex border-b border-black md:border-b-0 md:border-r">
          <div className="flex w-[70px] shrink-0 items-center justify-center border-r border-black px-2">
            <p className="font-outfit text-[15px] font-black uppercase tracking-[1px]">
              Live
            </p>
          </div>
          <div className="w-full md:w-[430px] lg:w-[500px]">
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
    getVoicesHeaderPlayerId(station.id),
  );
  const status = liveMetadata.status === "offAir" ? "OFF AIR" : "ON AIR";

  return (
    <div className="flex h-[34px] border-b border-black last:border-b-0">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      <div className="grid min-w-0 flex-1 grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 px-2 md:gap-4 md:px-3">
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
          <Square aria-hidden="true" size={12} fill="currentColor" />
        ) : (
          <Play aria-hidden="true" size={14} fill="currentColor" />
        )}
      </button>
    </div>
  );
}
