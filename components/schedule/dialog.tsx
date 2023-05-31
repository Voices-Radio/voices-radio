"use server";

import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { headers } from "next/headers";

export interface WeekInfo {
  monday: Day[];
  tuesday: Day[];
  wednesday: Day[];
  thursday: Day[];
  friday: Day[];
  saturday: Day[];
  sunday: Day[];
  nextmonday: Day[];
  nexttuesday: Day[];
  nextwednesday: Day[];
  nextthursday: Day[];
  nextfriday: Day[];
  nextsaturday: Day[];
  nextsunday: Day[];
  AIRTIME_API_VERSION: string;
}

export interface Day {
  start_timestamp: string;
  end_timestamp: string;
  name: string;
  description: string;
  id: number;
  instance_id: number;
  instance_description: string;
  record: number;
  url: string;
  image_path: string;
  image_cloud_file_id: null;
  auto_dj: boolean;
  starts: string;
  ends: string;
}

async function getScheduleData() {
  const headersList = headers();

  const timezone =
    headersList.get("x-vercel-ip-timezone") ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const r = await fetch(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${timezone}`,
    { next: { revalidate: 60 } }
  );

  const data: WeekInfo = await r.json();

  const date = utcToZonedTime(new Date(), timezone);

  const showsEntries: [string, Day[]][] = Object.entries(data)
    .filter(([, value]) => Array.isArray(value))
    .filter(([, days]) =>
      (days as Day[]).every((day) =>
        isBefore(startOfDay(date), new Date(day.starts))
      )
    );

  return showsEntries;

  const schedule: Day[] = Object.values(data).filter(Array.isArray).flat();

  const scheduleAfterToday = schedule.filter((day) =>
    isBefore(startOfDay(date), new Date(day.starts))
  );

  const scheduleByDay = scheduleAfterToday.reduce<{ [key: string]: Day[] }>(
    (prev, current) => {
      const date = format(
        startOfDay(new Date(current.start_timestamp)),
        "yyyy-MM-dd"
      );

      if (prev[date]) {
        return {
          ...prev,
          [date]: [...prev[date], current],
        };
      }

      return {
        ...prev,
        [date]: [current],
      };
    },
    {}
  );

  return scheduleByDay;
}

export default async function ScheduleDialog() {
  const data = await getScheduleData();

  return (
    <ul className="mx-auto max-w-5xl md:p-10">
      <div className="mb-4 flex items-center justify-center gap-16">
        <div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center text-inter-text text-white disabled:text-white/50"
            disabled
          >
            {`<-`}
          </button>
        </div>

        <div className="text-center text-inter-text text-white">
          <p>Monday 23/05</p>
        </div>

        <div>
          <button className="inline-flex h-8 w-8 items-center justify-center text-inter-text text-white disabled:text-white/50">
            {`->`}
          </button>
        </div>
      </div>

      {data.map(([date, shows]) => (
        <li key={date} className="">
          <p className="text-center text-inter-text text-white">{date}</p>

          <ul className="divide-y divide-white md:divide-none">
            {shows.length > 0 ? (
              shows.map((day) => {
                const timetable = `${format(new Date(day.starts), "HH:mm")} - 
                  ${format(new Date(day.ends), "HH:mm")}`;

                const isLive =
                  isBefore(new Date(day.starts), new Date()) &&
                  isAfter(new Date(day.ends), new Date());

                return (
                  <li
                    key={day.id}
                    className={`p-5 md:px-6 md:pb-0 md:pt-5 ${
                      isLive
                        ? "-mt-px rounded-xl bg-white text-black"
                        : "text-white"
                    }`}
                  >
                    <div className="flex items-center gap-8">
                      <p className="text-inter-small whitespace-nowrap tabular-nums">
                        {timetable}
                      </p>

                      <p className="flex-1 font-kinfolk text-mobile-kinfolk-artist uppercase md:text-kinfolk-artist">
                        {day.name}
                      </p>

                      {isLive && (
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
              })
            ) : (
              <div className="p-5">
                <p className="flex-1 text-center font-kinfolk text-mobile-kinfolk-artist uppercase text-white md:text-kinfolk-artist">
                  No Shows Scheduled For Today
                </p>
              </div>
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
}
