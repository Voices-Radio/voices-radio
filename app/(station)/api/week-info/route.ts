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
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 0;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tz = searchParams.get("tz");

  if (!tz) {
    return NextResponse.json(
      { message: "Param 'tz' is missing or invalid" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://voicesradio.airtime.pro/api/week-info?timezone=${tz}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

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
        .filter((show) => isSameDay(current, new Date(show.starts)))
        .map((day) => ({
          id: day.id,
          name: unescapeString(day.name),
          start_timestamp: day.start_timestamp,
          end_timestamp: day.end_timestamp,
          show_start_hour: format(new Date(day.starts), "HH:mm"),
          show_end_hour: format(new Date(day.ends), "HH:mm"),
          is_live:
            isBefore(new Date(day.starts), new Date()) &&
            isAfter(new Date(day.ends), new Date()),
        })),
    }),
    {}
  );

  return NextResponse.json(weekDays);
}
