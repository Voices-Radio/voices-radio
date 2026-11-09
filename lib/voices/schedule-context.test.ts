import { describe, expect, it } from "vitest";
import { getScheduleContext } from "./schedule-context";
import type { ProcessedWeekInfo } from "@/hooks/use-week-info";

function day(start: string, end: string, name: string) {
  return {
    id: Number(start.slice(-2)),
    station: "kx" as const,
    name,
    start_timestamp: start,
    end_timestamp: end,
    show_start_hour: start.slice(11, 16),
    show_end_hour: end.slice(11, 16),
    is_past: false,
    is_live: false,
  };
}

describe("getScheduleContext", () => {
  it("returns previous, now, and next shows around the current time", () => {
    const weekInfo: ProcessedWeekInfo = {
      kx: {
        "2026-08-24T00:00:00.000Z": [
          day(
            "2026-08-24T09:00:00.000Z",
            "2026-08-24T10:00:00.000Z",
            "Warm Up",
          ),
          day(
            "2026-08-24T10:00:00.000Z",
            "2026-08-24T11:00:00.000Z",
            "Live Show",
          ),
          day(
            "2026-08-24T11:00:00.000Z",
            "2026-08-24T12:00:00.000Z",
            "Next Show",
          ),
        ],
      },
      east: {},
    };

    expect(
      getScheduleContext(weekInfo, "kx", new Date("2026-08-24T10:30:00.000Z")),
    ).toEqual({
      previous: "Warm Up",
      current: "Live Show",
      next: "Next Show",
    });
  });

  it("falls back cleanly when there is no live show", () => {
    const weekInfo: ProcessedWeekInfo = {
      kx: {
        "2026-08-24T00:00:00.000Z": [
          day(
            "2026-08-24T09:00:00.000Z",
            "2026-08-24T10:00:00.000Z",
            "Earlier",
          ),
          day("2026-08-24T12:00:00.000Z", "2026-08-24T13:00:00.000Z", "Later"),
        ],
      },
      east: {},
    };

    expect(
      getScheduleContext(weekInfo, "kx", new Date("2026-08-24T10:30:00.000Z")),
    ).toEqual({
      previous: "Earlier",
      current: "Off air",
      next: "Later",
    });
  });

  it("returns TBA labels when schedule data is unavailable", () => {
    expect(getScheduleContext(undefined, "kx", new Date())).toEqual({
      previous: "TBA",
      current: "Off air",
      next: "TBA",
    });
  });
});
