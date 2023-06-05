import { unescapeString } from "@/lib/unescape";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import useSWR from "swr";

async function fetcher<JSON = any>(
  ...args: [input: RequestInfo, init?: RequestInit]
): Promise<JSON> {
  const r = await fetch(...args);
  if (r.ok) return r.json();
  throw new Error(`${r.status} ${r.statusText}`);
}

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

export async function getWeekInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const json = await fetcher<WeekInfo>(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${tz}`
  );

  const date = utcToZonedTime(new Date(), tz);

  const data: [string, Day[]][] = Object.entries(json)
    .filter(([, value]: [string, Day[] | string]) => Array.isArray(value))
    .filter(([, value]: [string, Day[]]) =>
      value.every((day) => isBefore(startOfDay(date), new Date(day.starts)))
    );

  const processed: [
    string,
    {
      id: number;
      name: string;
      show_start_hour: string;
      show_end_hour: string;
      is_live: boolean;
    }[]
  ][] = data.map(([dayOfWeek, days]) => {
    const formattedDays = days.map((day) => ({
      id: day.id,
      name: unescapeString(day.name),
      show_start_hour: format(new Date(day.starts), "HH:mm"),
      show_end_hour: format(new Date(day.ends), "HH:mm"),
      is_live:
        isBefore(new Date(day.starts), new Date()) &&
        isAfter(new Date(day.ends), new Date()),
    }));

    return [dayOfWeek, formattedDays];
  });

  return processed;
}

export default function useWeekInfo() {
  return useSWR("week-info", getWeekInfo);
}
