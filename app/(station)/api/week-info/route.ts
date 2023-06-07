import { Day, ProcessedDay, WeekInfo } from "@/hooks/use-week-info";
import { unescapeString } from "@/lib/unescape";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 60 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const headersList = headers();

  const tz =
    headersList.get("X-Vercel-IP-Timezone") ??
    searchParams.get("tz") ??
    "Europe/London";

  const res = await fetch(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${tz}`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: `${res.status} ${res.statusText}` },
      { status: 500 }
    );
  }

  const weekInfo: WeekInfo = await res.json();

  const date = utcToZonedTime(new Date(), tz);

  const data: [string, Day[]][] = Object.entries(weekInfo)
    .filter(([, value]: [string, Day[] | string]) => Array.isArray(value))
    .filter(([, value]: [string, Day[]]) =>
      value.every((day) => isBefore(startOfDay(date), new Date(day.starts)))
    );

  const processed: [string, ProcessedDay[]][] = data.map(
    ([dayOfWeek, days]) => {
      const formattedDays = days.map((day) => ({
        id: day.id,
        name: unescapeString(day.name),
        start_timestamp: day.start_timestamp,
        end_timestamp: day.end_timestamp,
        show_start_hour: format(new Date(day.starts), "HH:mm"),
        show_end_hour: format(new Date(day.ends), "HH:mm"),
        is_live:
          isBefore(new Date(day.starts), new Date()) &&
          isAfter(new Date(day.ends), new Date()),
      }));

      return [dayOfWeek, formattedDays];
    }
  );

  return NextResponse.json(processed);
}
