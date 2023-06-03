"use client";

import useWeekInfo from "@/hooks/use-week-info";
import { useState } from "react";

export default function ScheduleDialog() {
  const [index, indexSet] = useState(0);

  const { data } = useWeekInfo();

  if (data) {
    const [date, shows] = data[index];

    return (
      <div className="mx-auto max-w-5xl md:p-10">
        <div className="mb-4 flex items-center justify-center gap-16">
          <div className="flex-1">
            <button
              className="inline-flex h-8 w-8 items-center justify-center text-inter-text text-white disabled:text-white/50"
              disabled={index <= 0}
              onClick={() => indexSet(index - 1)}
            >
              {`<-`}
            </button>
          </div>

          <div className="flex-1 text-center text-inter-text text-white">
            <p>{date}</p>
          </div>

          <div className="flex-1">
            <button
              className="inline-flex h-8 w-8 items-center justify-center text-inter-text text-white disabled:text-white/50"
              onClick={() => indexSet(index + 1)}
            >
              {`->`}
            </button>
          </div>
        </div>

        {shows.length > 0 ? (
          <ul className="divide-y divide-white md:divide-none">
            {shows.map((day) => {
              return (
                <li
                  key={day.id}
                  className={`p-5 md:px-6 md:pb-0 md:pt-5 ${
                    day.is_live
                      ? "-mt-px bg-white text-black md:rounded-xl"
                      : "text-white"
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <p className="text-inter-small whitespace-nowrap tabular-nums">
                      {`${day.show_start_hour} - ${day.show_end_hour}`}
                    </p>

                    <p className="flex-1 font-kinfolk text-mobile-kinfolk-artist uppercase md:text-kinfolk-artist">
                      {day.name}
                    </p>

                    {day.is_live && (
                      <div className="flex items-center gap-2">
                        <p className="text-mobile-inter-xsmall">Live</p>

                        <div className="h-4 w-4 animate-pulse rounded-full bg-[#FF0000]" />
                      </div>
                    )}
                  </div>

                  <div className="hidden h-5 md:block" />

                  <div className="hidden h-px w-full bg-white md:block" />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5">
            <p className="flex-1 text-center font-kinfolk text-mobile-kinfolk-artist uppercase text-white md:text-kinfolk-artist">
              No Shows Scheduled For Today
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-5">
      <p className="text-center font-kinfolk text-mobile-kinfolk-artist uppercase text-white md:text-kinfolk-artist">
        Loading Schedule
      </p>
    </div>
  );
}
