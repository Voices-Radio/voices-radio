"use client";

import { MessageCircle, Play, Square, Video } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getVoicesHeaderPlayerId,
  voicesLiveStations,
  type VoicesLiveStationConfig,
} from "@/lib/voices/config";
import { getScheduleContext } from "@/lib/voices/schedule-context";
import useRadioCultLiveMetadata from "@/hooks/use-radio-cult-live-metadata";
import useStationAudio from "@/hooks/use-station-audio";
import useWeekInfo from "@/hooks/use-week-info";
import ScheduleDialog from "@/app/components/schedule/dialog";
import { EastComingSoonStrip } from "../components/redesign/east-coming-soon";

function MobileStationControl({
  station,
}: {
  station: VoicesLiveStationConfig;
}) {
  const liveMetadata = useRadioCultLiveMetadata(station.id);
  const { audioRef, loading, playing, toggle } = useStationAudio(
    station.streamUrl,
    getVoicesHeaderPlayerId(station.id),
  );
  const disabled = !station.streamUrl || loading || station.comingSoon;
  const title = station.comingSoon
    ? "Coming soon"
    : liveMetadata.title || station.title;
  const status = station.comingSoon
    ? "Tuning"
    : liveMetadata.status === "offAir"
      ? "Off air"
      : "On air";

  return (
    <div className="grid min-h-[52px] min-w-0 grid-cols-[minmax(0,1fr)_32px] items-stretch overflow-hidden bg-voicesNext-cream text-voicesNext-background">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      <div className="min-w-0 px-2 py-[7px]">
        <div className="flex items-center gap-1">
          <span className="font-outfit text-[20px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
            {station.label}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1 font-asap text-[8px] font-bold uppercase leading-none tracking-[0.8px] text-[#443f3f]/65">
            {status}
            <span
              className={cn(
                "size-1.5 rounded-full",
                station.comingSoon
                  ? "voices-east-tuning-dot bg-voicesNext-orange"
                  : "bg-voicesNext-live",
              )}
            />
          </span>
        </div>
        <p
          className="mt-1 truncate font-outfit text-[11px] font-medium uppercase leading-none tracking-[0.8px] text-[#443f3f]"
          title={title}
        >
          {title}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "inline-flex h-full w-full shrink-0 items-center justify-center border-l border-voicesNext-background transition-colors hover:bg-voicesNext-background hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange disabled:cursor-not-allowed disabled:text-[#443f3f]/35",
          playing && "bg-voicesNext-background text-voicesNext-cream",
        )}
        aria-label={
          playing ? `Pause ${station.label}` : `Play ${station.label}`
        }
      >
        {playing ? (
          <Square aria-hidden="true" size={12} fill="currentColor" />
        ) : station.videoUrl ? (
          <Video aria-hidden="true" size={16} strokeWidth={2.2} />
        ) : (
          <Play aria-hidden="true" size={14} fill="currentColor" />
        )}
      </button>
    </div>
  );
}

function MobileLiveControls() {
  const [kxStation, eastStation] = voicesLiveStations;

  if (!kxStation || !eastStation) return null;

  return (
    <div
      className="grid grid-cols-2 border-b border-voicesNext-background bg-voicesNext-cream md:hidden [&>*+*]:border-l [&>*+*]:border-voicesNext-background"
      aria-label="Mobile live controls"
    >
      <MobileStationControl station={kxStation} />
      <MobileStationControl station={eastStation} />
    </div>
  );
}

function ScheduleContextItems({ mobile = false }: { mobile?: boolean }) {
  const { data } = useWeekInfo();
  const context = getScheduleContext(data, "kx");
  const items = [
    { label: "Previous", value: context.previous },
    { label: "Now", value: context.current },
    { label: "Next", value: context.next },
  ];

  return (
    <div
      className={cn(
        "grid min-w-0 text-voicesNext-background",
        mobile
          ? "grid-cols-3 divide-x divide-voicesNext-background border-b border-voicesNext-background"
          : "h-full flex-1 grid-cols-3 divide-x divide-black",
      )}
      aria-label="KX schedule context"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 px-2",
            mobile
              ? "min-h-[56px] py-[9px]"
              : "flex flex-col justify-center px-3 lg:px-4 xl:px-5",
          )}
        >
          <p className="font-asap text-[9px] font-bold uppercase leading-none tracking-[1px] text-[#443f3f]/70 md:text-[10px]">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-outfit font-black uppercase leading-none tracking-[1px] text-[#443f3f]",
              mobile ? "text-[12px]" : "text-[12px] lg:text-[13px]",
            )}
            title={item.value}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlayerActions({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 divide-x divide-black",
        mobile
          ? "h-11 divide-voicesNext-background"
          : "h-full border-l border-black",
      )}
      aria-label="Player actions"
    >
      <ScheduleDialog
        classNames={cn(
          "inline-flex h-full items-center justify-center gap-2 rounded-none bg-voicesNext-cream px-4 font-gabarito font-bold uppercase leading-none text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange",
          mobile ? "flex-1 text-[13px]" : "w-[118px] text-[13px]",
        )}
      />
      <Link
        href="/chat"
        className={cn(
          "inline-flex h-full items-center justify-center gap-2 bg-voicesNext-cream px-4 font-gabarito font-bold uppercase leading-none text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange",
          mobile ? "flex-1 text-[13px]" : "w-[104px] text-[13px]",
        )}
      >
        <MessageCircle aria-hidden="true" size={15} strokeWidth={2.4} />
        Chat
      </Link>
    </div>
  );
}

function MobileSchedulePanel() {
  return (
    <div className="border-b border-voicesNext-background bg-voicesNext-cream md:hidden">
      <ScheduleContextItems mobile />
      <PlayerActions mobile />
    </div>
  );
}

export default function ExploreLiveStrip() {
  return (
    <section aria-label="Live player">
      <MobileLiveControls />
      <MobileSchedulePanel />
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
        <ScheduleContextItems />
        <PlayerActions />
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
          "inline-flex h-[34px] w-[35px] shrink-0 items-center justify-center border-l border-black transition-colors hover:bg-voicesNext-background hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange disabled:cursor-not-allowed disabled:text-voicesNext-secondary",
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
