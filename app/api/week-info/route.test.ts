import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Station config is read from the environment at import time, so it has to be
// in place before the route module loads.
process.env.NEXT_PUBLIC_RADIOCULT_API_KEY = "test-key";
process.env.NEXT_PUBLIC_RADIOCULT_KX_STATION_ID = "kx-station";

const { GET } = await import("./route");

// Sunday 13 Sep 2026, 13:00 in London (BST, UTC+1).
const NOW = new Date("2026-09-13T12:00:00.000Z");

// Midnight London time, expressed as UTC instants.
const SUN_13 = "2026-09-12T23:00:00.000Z";
const MON_14 = "2026-09-13T23:00:00.000Z";

const EVENTS = [
  {
    id: "b2",
    title: "Lunch Live",
    startDateUtc: "2026-09-13T11:30:00.000Z",
    endDateUtc: "2026-09-13T12:30:00.000Z",
  },
  {
    id: "a1",
    title: "Morning Show",
    startDateUtc: "2026-09-13T08:00:00.000Z",
    endDateUtc: "2026-09-13T09:00:00.000Z",
  },
  {
    // 00:30 on Monday in London, but still Sunday in UTC.
    id: "c3",
    title: "Late Night",
    startDateUtc: "2026-09-13T23:30:00.000Z",
    endDateUtc: "2026-09-14T00:30:00.000Z",
  },
];

const fetchMock = vi.fn();

function radioCultResponds(body: unknown, status = 200) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function requestWeekInfo(tz: string | null = "Europe/London") {
  const query = tz === null ? "" : `?tz=${encodeURIComponent(tz)}`;
  return GET(new Request(`https://staging.example/api/week-info${query}`));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("GET /api/week-info", () => {
  it("reads events from RadioCult's { success, schedules } envelope", async () => {
    radioCultResponds({ success: true, schedules: EVENTS });

    const response = await requestWeekInfo();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.kx[SUN_13].map((show: { name: string }) => show.name)).toEqual(
      ["Morning Show", "Lunch Live"],
    );
  });

  it("groups shows by the viewer's calendar day, not the UTC day", async () => {
    radioCultResponds({ success: true, schedules: EVENTS });

    const payload = await (await requestWeekInfo()).json();

    expect(payload.kx[MON_14]).toEqual([
      expect.objectContaining({
        name: "Late Night",
        show_start_hour: "00:30",
        show_end_hour: "01:30",
      }),
    ]);
  });

  it("formats hours in the viewer's timezone and flags past and live shows", async () => {
    radioCultResponds({ success: true, schedules: EVENTS });

    const payload = await (await requestWeekInfo()).json();
    const [morning, lunch] = payload.kx[SUN_13];

    expect(morning).toMatchObject({
      station: "kx",
      show_start_hour: "09:00",
      show_end_hour: "10:00",
      is_past: true,
      is_live: false,
    });
    expect(lunch).toMatchObject({ is_past: false, is_live: true });
  });

  it("returns eight days for every station, with EAST empty", async () => {
    radioCultResponds({ success: true, schedules: EVENTS });

    const payload = await (await requestWeekInfo()).json();

    expect(Object.keys(payload.kx)).toHaveLength(8);
    expect(Object.keys(payload.kx)[0]).toBe(SUN_13);
    expect(Object.keys(payload.east)).toEqual(Object.keys(payload.kx));
    expect(Object.values(payload.east).flat()).toEqual([]);
  });

  it("requests the full eight-day window from RadioCult for KX", async () => {
    radioCultResponds({ success: true, schedules: [] });

    await requestWeekInfo();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const requested = new URL(url);
    expect(requested.pathname).toBe("/api/station/kx-station/schedule");
    expect(requested.searchParams.get("startDate")).toBe(SUN_13);
    expect(requested.searchParams.get("endDate")).toBe(
      "2026-09-20T23:00:00.000Z",
    );
    expect(init.headers["x-api-key"]).toBe("test-key");
  });

  it("returns 502 when RadioCult fails", async () => {
    radioCultResponds({ message: "rate limited" }, 429);

    const response = await requestWeekInfo();

    expect(response.status).toBe(502);
  });

  it("returns 502 rather than an empty schedule when the response shape is unexpected", async () => {
    radioCultResponds({ success: true, items: EVENTS });

    const response = await requestWeekInfo();

    expect(response.status).toBe(502);
  });

  it.each([null, "Not/AZone"])("rejects a missing or invalid tz (%s)", async (tz) => {
    const response = await requestWeekInfo(tz);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
