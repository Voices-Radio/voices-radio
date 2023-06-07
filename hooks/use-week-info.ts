import useSWR from "swr";

async function fetcher<JSON = any>(
  ...args: [input: RequestInfo, init?: RequestInit]
): Promise<JSON> {
  const r = await fetch(...args);
  if (r.ok) return r.json();
  throw new Error((await r.json()).message);
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

export default function useWeekInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useSWR<
    [
      string,
      {
        id: number;
        name: string;
        start_timestamp: string;
        end_timestamp: string;
        show_start_hour: string;
        show_end_hour: string;
        is_live: boolean;
      }[]
    ][]
  >(`/api/week-info?tz=${tz}`, fetcher);
}
