"use server";

import { format, isAfter, isBefore, startOfDay, startOfToday } from "date-fns";
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

async function getScheduleData(): Promise<WeekInfo> {
  const headersList = headers();

  const timezone =
    headersList.get("x-vercel-ip-timezone") ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const r = await fetch(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${timezone}`,
    { next: { revalidate: 60 } }
  );

  return r.json();
}

export default async function ScheduleContent() {
  const data = await getScheduleData();

  const schedule: Day[] = Object.values(data).filter(Array.isArray).flat();

  const scheduleAfterToday = schedule.filter((day) =>
    isBefore(startOfToday(), new Date(day.starts))
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

  return (
    <ul>
      {Object.entries(scheduleByDay).map(([date, shows]) => (
        <li key={date} className="">
          <p className="text-inter-text text-center text-white">
            {format(new Date(date), "EEEE dd/MM")}
          </p>

          <ul className="">
            {shows.map((day) => {
              const timetable = `${format(new Date(day.starts), "HH:mm")} - 
                  ${format(new Date(day.ends), "HH:mm")}`;

              const isLive =
                isBefore(new Date(day.starts), new Date()) &&
                isAfter(new Date(day.ends), new Date());

              return (
                <li
                  key={day.id}
                  className={`pt-5 px-6 ${
                    isLive
                      ? "bg-white text-black rounded-xl -mt-px"
                      : "text-white"
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <p className="whitespace-nowrap text-inter-small tabular-nums">
                      {timetable}
                    </p>

                    <p className="font-kinfolk text-mobile-kinfolk-artist leading-7 md:leading-10 uppercase md:text-kinfolk-artist flex-1">
                      {day.name}
                    </p>

                    {isLive && (
                      <div className="flex items-center gap-2">
                        <p className="text-mobile-inter-xsmall">Live</p>

                        <div className="rounded-full h-4 w-4 bg-[#FF0000] animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="h-5" />

                  <div className="h-px w-full bg-white" />
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
