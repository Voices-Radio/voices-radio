import type { ProcessedDay, ProcessedWeekInfo } from "@/hooks/use-week-info";
import type { VoicesLiveStationId } from "./config";

export type ScheduleContext = {
  previous: string;
  current: string;
  next: string;
};

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function flattenStationSchedule(
  weekInfo: ProcessedWeekInfo | undefined,
  station: VoicesLiveStationId,
) {
  return Object.values(weekInfo?.[station] ?? {})
    .flat()
    .filter((item): item is ProcessedDay =>
      Boolean(item.start_timestamp && item.end_timestamp),
    )
    .sort((a, b) => {
      const aStart = getTimestamp(a.start_timestamp) ?? 0;
      const bStart = getTimestamp(b.start_timestamp) ?? 0;
      return aStart - bStart;
    });
}

export function getScheduleContext(
  weekInfo: ProcessedWeekInfo | undefined,
  station: VoicesLiveStationId,
  now = new Date(),
): ScheduleContext {
  const nowTimestamp = now.getTime();
  const shows = flattenStationSchedule(weekInfo, station);

  if (!shows.length) {
    return { previous: "TBA", current: "Off air", next: "TBA" };
  }

  const currentIndex = shows.findIndex((show) => {
    const starts = getTimestamp(show.start_timestamp);
    const ends = getTimestamp(show.end_timestamp);
    return (
      starts !== null &&
      ends !== null &&
      starts <= nowTimestamp &&
      ends > nowTimestamp
    );
  });

  if (currentIndex >= 0) {
    return {
      previous: shows[currentIndex - 1]?.name ?? "TBA",
      current: shows[currentIndex].name,
      next: shows[currentIndex + 1]?.name ?? "TBA",
    };
  }

  const previous = [...shows]
    .reverse()
    .find(
      (show) => (getTimestamp(show.end_timestamp) ?? Infinity) <= nowTimestamp,
    );
  const next = shows.find(
    (show) => (getTimestamp(show.start_timestamp) ?? -Infinity) > nowTimestamp,
  );

  return {
    previous: previous?.name ?? "TBA",
    current: "Off air",
    next: next?.name ?? "TBA",
  };
}
