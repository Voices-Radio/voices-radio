"use client";

import { CalendarDays, MessageCircle, Play, Square, Video } from "lucide-react";
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

/**
 * Shared skin for the three icon buttons on the right of each mobile strip.
 * They sit full-height in a ~52px row, so the 38/44px widths clear WCAG 2.5.8's
 * 24x24 minimum target size comfortably.
 */
const mobileActionClassName =
  "inline-flex h-full shrink-0 items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange";

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
    <div className="grid min-h-[52px] min-w-0 grid-cols-[minmax(0,1fr)_auto] items-stretch overflow-hidden bg-voicesNext-cream text-voicesNext-background">
      <audio ref={audioRef} src={station.streamUrl} preload="none" />
      <div className="min-w-0 px-2 py-[7px]">
        <div className="flex items-center gap-1">
          <span className="font-outfit text-[20px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
            {station.label}
          </span>
          <span className="text-[#443f3f]/65 inline-flex min-w-0 items-center gap-1 font-asap text-[8px] font-bold uppercase leading-none tracking-[0.8px]">
            {status}
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
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
      <div className="flex divide-x divide-voicesNext-background border-l border-voicesNext-background">
        <ScheduleDialog
          label={`Open ${station.label} schedule`}
          initialStation={station.id}
          classNames={cn(
            mobileActionClassName,
            "w-[38px] rounded-none bg-voicesNext-cream text-[#443f3f] hover:bg-voicesNext-background hover:text-voicesNext-cream",
          )}
        >
          <CalendarDays
            aria-hidden="true"
            className="voices-schedule-pulse"
            size={16}
            strokeWidth={2.2}
          />
        </ScheduleDialog>
        <Link
          href="/chat"
          aria-label="Open chat"
          className={cn(
            mobileActionClassName,
            "w-[38px] bg-voicesNext-cream text-[#443f3f] hover:bg-voicesNext-background hover:text-voicesNext-cream",
          )}
        >
          <MessageCircle
            aria-hidden="true"
            className="voices-chat-bubble"
            size={16}
            strokeWidth={2.2}
          />
        </Link>
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          className={cn(
            mobileActionClassName,
            // Disabled keeps a faint tint rather than falling back to plain
            // cream — East stays disabled until launch, and a fully cream cell
            // reads as an empty gap rather than an inactive control.
            "w-[44px] bg-voicesNext-orangeButton text-voicesNext-cream hover:bg-voicesNext-background disabled:cursor-not-allowed disabled:bg-[#443f3f]/[0.12] disabled:text-[#443f3f]/40",
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
    </div>
  );
}

function MobileLiveControls() {
  const [kxStation, eastStation] = voicesLiveStations;

  if (!kxStation || !eastStation) return null;

  return (
    <div
      className="flex flex-col border-b border-voicesNext-background bg-voicesNext-cream md:hidden [&>*+*]:border-t [&>*+*]:border-voicesNext-background"
      aria-label="Mobile live controls"
    >
      <MobileStationControl station={kxStation} />
      <MobileStationControl station={eastStation} />
    </div>
  );
}

function ScheduleContextItems() {
  const { data } = useWeekInfo();
  const context = getScheduleContext(data, "kx");
  const items = [
    { label: "Previous", value: context.previous },
    { label: "Now", value: context.current },
    { label: "Next", value: context.next },
  ];

  return (
    <div
      className="grid h-full min-w-0 flex-1 grid-cols-3 divide-x divide-black text-voicesNext-background"
      aria-label="KX schedule context"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col justify-center px-3 lg:px-4 xl:px-5"
        >
          <p className="font-asap text-[9px] font-bold uppercase leading-none tracking-[1px] text-[#443f3f]/70 md:text-[10px]">
            {item.label}
          </p>
          <p
            className="mt-1 truncate font-outfit text-[12px] font-black uppercase leading-none tracking-[1px] text-[#443f3f] lg:text-[13px]"
            title={item.value}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlayerActions() {
  return (
    <div
      className="flex h-full shrink-0 divide-x divide-black border-l border-black"
      aria-label="Player actions"
    >
      <ScheduleDialog classNames="inline-flex h-full w-[118px] items-center justify-center gap-2 rounded-none bg-voicesNext-cream px-4 font-gabarito text-[13px] font-bold uppercase leading-none text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange" />
      <Link
        href="/chat"
        className="inline-flex h-full w-[104px] items-center justify-center gap-2 bg-voicesNext-cream px-4 font-gabarito text-[13px] font-bold uppercase leading-none text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange"
      >
        <MessageCircle aria-hidden="true" size={15} strokeWidth={2.4} />
        Chat
      </Link>
    </div>
  );
}

export default function ExploreLiveStrip() {
  return (
    <section aria-label="Live player">
      <MobileLiveControls />
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
          <span className="h-2 w-2 rounded-full bg-voicesNext-live" />
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
