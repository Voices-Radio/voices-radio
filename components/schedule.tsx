import { format, startOfDay } from "date-fns";
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

export default async function Schedule() {
  const headersList = headers();

  const timezone = headersList.get("x-vercel-ip-timezone");

  const r = await fetch(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${
      timezone ?? "Europe/London"
    }`,
    { next: { revalidate: 60 } }
  );

  const data: WeekInfo = await r.json();

  const schedule: Day[] = Object.values(data).filter(Array.isArray).flat();

  const scheduleByDay = schedule.reduce<{ [key: string]: Day[] }>(
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
    <div className="p-8">
      <p>Schedule: {timezone ?? "Missing Timezone"}</p>

      <ul className="space-y-4">
        {Object.entries(scheduleByDay).map(([date, shows]) => (
          <li key={date}>
            <p>{format(new Date(date), "E dd")}</p>

            <ul>
              {shows.map((day) => (
                <li key={day.id} className="flex gap-2">
                  <p>
                    {`${format(new Date(day.starts), "HH:mm")} - 
              ${format(new Date(day.ends), "HH:mm")}`}
                  </p>

                  <p>{day.name}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
