import { ProcessedDay, type ProcessedWeekInfo } from "@/hooks/use-week-info";
import {
  getVoicesLiveStation,
  type VoicesLiveStationId,
} from "@/lib/voices/config";
import {
  getRadioCultApiUrl,
  getRadioCultHeaders,
  getRadioCultStationId,
  type RadioCultScheduleEvent,
} from "@/lib/voices/radio-cult";
import { unescapeString } from "@/lib/unescape";
import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 60;

const stations: VoicesLiveStationId[] = ["kx"];

// Today plus the following seven days.
const DAYS_SHOWN = 8;

const DAY_FORMAT = "yyyy-MM-dd";

type ScheduleDay = {
  // Calendar date in the viewer's timezone, used to bucket shows.
  date: string;
  // Midnight of that date in the viewer's timezone, as a UTC instant. The
  // client renders it with `new Date()`, so it lands on the right day.
  key: string;
};

type DatedEvent = {
  event: RadioCultScheduleEvent;
  starts: Date;
  ends: Date | null;
};

function getEventDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function midnightInTimeZone(date: string, tz: string) {
  return zonedTimeToUtc(`${date}T00:00:00`, tz);
}

/**
 * The days shown and the UTC range that covers them. Days are the viewer's
 * calendar days: the route runs in UTC, so bucketing by UTC day would file a
 * 00:30 BST show under the previous day.
 */
function getScheduleWindow(tz: string, now: Date) {
  const today = parseISO(formatInTimeZone(now, tz, DAY_FORMAT));
  const dateAt = (offset: number) => format(addDays(today, offset), DAY_FORMAT);

  const days: ScheduleDay[] = Array.from({ length: DAYS_SHOWN }, (_, offset) => {
    const date = dateAt(offset);
    return { date, key: midnightInTimeZone(date, tz).toISOString() };
  });

  return {
    days,
    start: midnightInTimeZone(dateAt(0), tz),
    end: midnightInTimeZone(dateAt(DAYS_SHOWN), tz),
  };
}

async function fetchRadioCultSchedule(
  station: VoicesLiveStationId,
  startDate: Date,
  endDate: Date,
) {
  const radioCultStationId = getRadioCultStationId(station);
  const headers = getRadioCultHeaders();

  if (!radioCultStationId || !headers) return [];

  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    expand: "artist,tags",
  });
  const response = await fetch(
    getRadioCultApiUrl(
      `/api/station/${radioCultStationId}/schedule?${params.toString()}`,
    ),
    { headers, next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error(`Radio Cult schedule request failed: ${response.status}`);
  }

  const payload = await response.json();

  // RadioCult wraps collections as { success, schedules: [...] }. Anything
  // else is an error, not an empty week.
  if (payload?.success === false || !Array.isArray(payload?.schedules)) {
    throw new Error("Radio Cult schedule response had an unexpected shape");
  }

  return payload.schedules as RadioCultScheduleEvent[];
}

function emptyWeekDays(days: ScheduleDay[]) {
  return Object.fromEntries(
    days.map(({ key }) => [key, [] as ProcessedDay[]]),
  );
}

function toDatedEvents(events: RadioCultScheduleEvent[]) {
  return events
    .map((event) => ({
      event,
      starts: getEventDate(event.startDateUtc ?? event.startDate),
      ends: getEventDate(event.endDateUtc ?? event.endDate),
    }))
    .filter((item): item is DatedEvent => item.starts !== null)
    .sort((a, b) => a.starts.getTime() - b.starts.getTime());
}

function processSchedule(
  station: VoicesLiveStationId,
  events: RadioCultScheduleEvent[],
  days: ScheduleDay[],
  tz: string,
  now: Date,
) {
  const stationLabel = getVoicesLiveStation(station)?.label ?? station;
  const datedEvents = toDatedEvents(events);

  return Object.fromEntries(
    days.map(({ date, key }) => [
      key,
      datedEvents
        .filter(({ starts }) => formatInTimeZone(starts, tz, DAY_FORMAT) === date)
        .map(
          ({ event, starts, ends }, index): ProcessedDay => ({
            id: Number(event.id) || index,
            station,
            name: unescapeString(event.title ?? `${stationLabel} Show`),
            start_timestamp: starts.toISOString(),
            end_timestamp: ends?.toISOString() ?? "",
            show_start_hour: formatInTimeZone(starts, tz, "HH:mm"),
            show_end_hour: ends ? formatInTimeZone(ends, tz, "HH:mm") : "",
            is_past: ends ? isBefore(ends, now) : false,
            is_live: ends ? isBefore(starts, now) && isAfter(ends, now) : false,
          }),
        ),
    ]),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tz = searchParams.get("tz");

  if (!tz || !isValidTimeZone(tz)) {
    return NextResponse.json(
      { message: "Param 'tz' is missing or invalid" },
      { status: 400 },
    );
  }

  try {
    const now = new Date();
    const { days, start, end } = getScheduleWindow(tz, now);
    const schedules = await Promise.all(
      stations.map(
        async (station) =>
          [station, await fetchRadioCultSchedule(station, start, end)] as const,
      ),
    );
    const weekInfo = schedules.reduce<ProcessedWeekInfo>(
      (prev, [station, events]) => ({
        ...prev,
        [station]: processSchedule(station, events, days, tz, now),
      }),
      { kx: emptyWeekDays(days), east: emptyWeekDays(days) },
    );

    return NextResponse.json(weekInfo);
  } catch (error) {
    console.error("Radio Cult schedule unavailable", error);
    return NextResponse.json(
      { message: "Radio Cult schedule unavailable" },
      { status: 502 },
    );
  }
}
