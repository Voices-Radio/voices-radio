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
import {
  addWeeks,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const revalidate = 60;

const stations: VoicesLiveStationId[] = ["kx"];

function getEventDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

  if (Array.isArray(payload)) return payload as RadioCultScheduleEvent[];
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

function emptyWeekDays() {
  return eachDayOfInterval({
    start: startOfDay(new Date()),
    end: addWeeks(startOfDay(new Date()), 1),
  }).reduce<{ [key: string]: ProcessedDay[] }>(
    (prev, current) => ({ ...prev, [current.toISOString()]: [] }),
    {},
  );
}

function processSchedule(
  station: VoicesLiveStationId,
  events: RadioCultScheduleEvent[],
  tz: string,
) {
  const stationLabel = getVoicesLiveStation(station)?.label ?? station;

  return eachDayOfInterval({
    start: startOfDay(new Date()),
    end: addWeeks(startOfDay(new Date()), 1),
  }).reduce<{ [key: string]: ProcessedDay[] }>(
    (prev, current) => ({
      ...prev,
      [current.toISOString()]: events
        .filter((event) => {
          const starts = getEventDate(event.startDateUtc ?? event.startDate);
          return starts ? isSameDay(current, starts) : false;
        })
        .map((event, index) => {
          const starts = getEventDate(event.startDateUtc ?? event.startDate);
          const ends = getEventDate(event.endDateUtc ?? event.endDate);
          const startTimestamp = starts?.toISOString() ?? "";
          const endTimestamp = ends?.toISOString() ?? "";

          return {
            id: Number(event.id) || index,
            station,
            name: unescapeString(event.title ?? `${stationLabel} Show`),
            start_timestamp: startTimestamp,
            end_timestamp: endTimestamp,
            show_start_hour: starts
              ? formatInTimeZone(starts, tz, "HH:mm")
              : "",
            show_end_hour: ends ? formatInTimeZone(ends, tz, "HH:mm") : "",
            is_past: ends ? isBefore(ends, new Date()) : false,
            is_live:
              starts && ends
                ? isBefore(starts, new Date()) && isAfter(ends, new Date())
                : false,
          };
        }),
    }),
    {},
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tz = searchParams.get("tz");

  if (!tz) {
    return NextResponse.json(
      { message: "Param 'tz' is missing or invalid" },
      { status: 500 },
    );
  }

  try {
    const startDate = startOfDay(new Date());
    const endDate = addWeeks(startDate, 1);
    const schedules = await Promise.all(
      stations.map(async (station) => [
        station,
        await fetchRadioCultSchedule(station, startDate, endDate),
      ]),
    );
    const weekInfo = schedules.reduce<ProcessedWeekInfo>(
      (prev, [station, events]) => ({
        ...prev,
        [station as VoicesLiveStationId]: processSchedule(
          station as VoicesLiveStationId,
          events as RadioCultScheduleEvent[],
          tz,
        ),
      }),
      { kx: emptyWeekDays(), east: emptyWeekDays() },
    );

    return NextResponse.json(weekInfo);
  } catch {
    return NextResponse.json(
      { message: "Radio Cult schedule unavailable" },
      { status: 502 },
    );
  }
}
