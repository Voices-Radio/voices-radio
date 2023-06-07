import { Day, ProcessedDay, WeekInfo } from "@/hooks/use-week-info";
import { unescapeString } from "@/lib/unescape";
import is from "@sindresorhus/is";
import {
  addWeeks,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 60;

export async function GET() {
  const headersList = headers();

  const tz = headersList.get("X-Vercel-IP-Timezone") ?? "Europe/London";

  const res = await fetch(`https://voicesradio.airtime.pro/api/week-info`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: `${res.status} ${res.statusText}` },
      { status: 500 }
    );
  }

  const weekInfo: WeekInfo = await res.json();
  const weekInfoValues: string | Day[] = Object.values(weekInfo).flat();

  const shows = weekInfoValues.filter(is.object);

  const weekDays = eachDayOfInterval({
    start: startOfDay(new Date()),
    end: addWeeks(startOfDay(new Date()), 1),
  }).reduce<{ [key: string]: ProcessedDay[] }>(
    (prev, current) => ({
      ...prev,
      [current.toISOString()]: shows
        .filter((show) =>
          isSameDay(current, zonedTimeToUtc(new Date(show.starts), tz))
        )
        .map((day) => ({
          id: day.id,
          name: unescapeString(day.name),
          start_timestamp: day.start_timestamp,
          end_timestamp: day.end_timestamp,
          show_start_hour: format(
            zonedTimeToUtc(new Date(day.starts), tz),
            "HH:mm"
          ),
          show_end_hour: format(
            zonedTimeToUtc(new Date(day.ends), tz),
            "HH:mm"
          ),
          is_live:
            isBefore(zonedTimeToUtc(new Date(day.starts), tz), new Date()) &&
            isAfter(zonedTimeToUtc(new Date(day.ends), tz), new Date()),
        })),
    }),
    {}
  );

  return NextResponse.json(weekDays);
}
