import { isBefore, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import useSWR from "swr";

async function fetcher<JSON = any>(
  ...args: [input: RequestInfo, init?: RequestInit]
): Promise<JSON> {
  const r = await fetch(args[0], { ...args[1] });
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

  return data;
}

export default function useWeekInfo() {
  return useSWR("week-info", getWeekInfo);
}
