"use client";

import useWeekInfo from "@/hooks/use-week-info";
import { useState } from "react";
import Show from "./show";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  voicesLiveStations,
  type VoicesLiveStationId,
} from "@/lib/voices/config";

export default function ScheduleList({
  initialStation = "kx",
}: {
  initialStation?: VoicesLiveStationId;
}) {
  const [index, indexSet] = useState(0);
  const [station, setStation] = useState<VoicesLiveStationId>(initialStation);

  const { data } = useWeekInfo();

  if (data) {
    const stationData = data[station] ?? {};
    const entries = Object.entries(stationData);
    const [date, shows] = entries[index] ??
      entries[0] ?? [new Date().toISOString(), []];

    return (
      <div className="mx-auto w-full max-w-3xl px-3 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6">
        <div className="border-white/15 sticky top-3 z-10 mx-auto mb-3 flex w-fit rounded-full border bg-black/40 p-1 shadow-lg shadow-black/20 backdrop-blur-xl">
          {voicesLiveStations.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStation(item.id);
                indexSet(0);
              }}
              className={cn(
                "rounded-full px-5 py-2 text-mobile-inter-small font-black uppercase text-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white",
                station === item.id && "bg-white text-black",
              )}
              aria-pressed={station === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="border-white/15 sticky top-3 z-10 mx-auto mb-4 grid w-fit max-w-full grid-cols-[2.25rem_auto_2.25rem] items-center gap-3 rounded-full border bg-black/40 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-xl md:mb-5 md:gap-5 md:px-4">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-full text-mobile-inter-text text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white disabled:text-white/40 disabled:hover:bg-transparent md:text-inter-text-small"
            disabled={index <= 0}
            onClick={() => indexSet(index - 1)}
          >
            <span role="img" aria-label="Left">{`<-`}</span>
          </button>

          <p className="min-h-9 flex items-center justify-center whitespace-nowrap text-center text-mobile-inter-text capitalize leading-none text-white md:text-inter-text-small">
            {format(new Date(date), "eeee dd/MM")}
          </p>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center justify-self-start rounded-full text-mobile-inter-text text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white disabled:text-white/40 disabled:hover:bg-transparent md:text-inter-text-small"
            onClick={() => indexSet(index + 1)}
            disabled={index >= entries.length - 1}
          >
            <span role="img" aria-label="Right">{`->`}</span>
          </button>
        </div>

        {shows.length > 0 ? (
          <ul className="divide-y divide-white md:divide-none">
            {shows.map((day) => (
              <Show key={day.id} day={day} />
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <p className="flex-1 text-center text-2xl font-black uppercase leading-none text-white md:text-4xl">
              No Shows Scheduled For Today
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-5">
      <p className="text-center text-2xl font-black uppercase leading-none text-white md:text-4xl">
        Loading Schedule
      </p>
    </div>
  );
}
