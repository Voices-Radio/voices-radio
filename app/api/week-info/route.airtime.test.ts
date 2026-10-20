import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// KX defaults to Airtime; make sure no RadioCult env leaks in and rescues it.
delete process.env.NEXT_PUBLIC_VOICES_KX_LIVE_SOURCE;
delete process.env.RADIOCULT_API_KEY;
delete process.env.NEXT_PUBLIC_RADIOCULT_KX_STATION_ID;

const { GET } = await import("./route");

// Sunday 13 Sep 2026, 13:00 in London (BST, UTC+1).
const NOW = new Date("2026-09-13T12:00:00.000Z");
const SUN_13 = "2026-09-12T23:00:00.000Z";
const MON_14 = "2026-09-13T23:00:00.000Z";

const show = (
  instance_id: number,
  name: string,
  starts: string,
  ends: string,
) => ({ name, id: 7, instance_id, starts, ends });

// Airtime's own day keys are deliberately wrong: its "sunday" bucket holds the
// Monday 00:30 show, as it files by the station's local day.
const WEEK = {
  sunday: [
    show(1, "Lunch Live", "2026-09-13 11:30:00", "2026-09-13 12:30:00"),
    show(3, "Roots &amp; Reggae", "2026-09-13 23:30:00", "2026-09-14 00:30:00"),
  ],
  nextsunday: [
    show(2, "Morning Show", "2026-09-13 08:00:00", "2026-09-13 09:00:00"),
  ],
  AIRTIME_API_VERSION: "1.1",
};

const fetchMock = vi.fn();

function request(tz = "Europe/London") {
  return GET(
    new Request(
      `https://staging.example/api/week-info?tz=${encodeURIComponent(tz)}`,
    ),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => WEEK,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/week-info with KX on Airtime", () => {
  it("calls Airtime for UTC and not RadioCult", async () => {
    await request();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/week-info?timezone=UTC",
    );
  });

  it("buckets by the viewer's day, ignoring Airtime's day keys", async () => {
    const body = await (await request()).json();

    expect(body.kx[SUN_13].map((d: { name: string }) => d.name)).toEqual([
      "Morning Show",
      "Lunch Live",
    ]);
    // 00:30 Monday in London, filed under Sunday by Airtime.
    expect(body.kx[MON_14].map((d: { name: string }) => d.name)).toEqual([
      "Roots & Reggae",
    ]);
  });

  it("marks the show on air as live", async () => {
    const body = await (await request()).json();
    const lunch = body.kx[SUN_13].find(
      (d: { name: string }) => d.name === "Lunch Live",
    );

    expect(lunch).toMatchObject({
      is_live: true,
      is_past: false,
      show_start_hour: "12:30",
    });
  });

  it("returns 502 rather than an empty week when Airtime changes shape", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ AIRTIME_API_VERSION: "2.0" }),
    });

    expect((await request()).status).toBe(502);
  });

  it("returns 502 when Airtime is down", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    expect((await request()).status).toBe(502);
  });
});
