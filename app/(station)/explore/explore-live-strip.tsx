"use client";

import { MessageCircle, Play, Square, Video } from "lucide-react";
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
          ? "grid-cols-3 divide-x divide-voicesNext-background"
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
              ? "py-2"
              : "flex flex-col justify-center px-3 lg:px-4 xl:px-5",
          )}
        >
          <p className="font-asap text-[9px] font-bold uppercase leading-none tracking-[1px] text-[#443f3f]/70 md:text-[10px]">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-outfit font-black uppercase leading-none tracking-[1px] text-[#443f3f]",
              mobile ? "text-[11px]" : "text-[12px] lg:text-[13px]",
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
          ? "h-10 border-t border-voicesNext-background"
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
      <button
        type="button"
        disabled
        className={cn(
          "text-[#443f3f]/45 inline-flex h-full cursor-not-allowed items-center justify-center gap-2 bg-voicesNext-cream px-4 font-gabarito font-bold uppercase leading-none",
          mobile ? "flex-1 text-[13px]" : "w-[104px] text-[13px]",
        )}
        aria-label="Chat coming soon"
      >
        <MessageCircle aria-hidden="true" size={15} strokeWidth={2.4} />
        Chat
      </button>
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
