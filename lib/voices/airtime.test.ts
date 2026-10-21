import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchAirtimeLiveMetadata,
  fetchAirtimeSchedule,
  normalizeAirtimeLiveMetadata,
  parseAirtimeTime,
} from "./airtime";
import { fetchLiveShowArtistImage } from "./live-show-artist";

vi.mock("./live-show-artist", () => ({ fetchLiveShowArtistImage: vi.fn() }));

const SHOW = {
  name: "Roots &amp; Reggae w/ Rikette",
  id: 9889,
  instance_id: 50835,
  starts: "2026-10-20 13:00:00",
  ends: "2026-10-20 14:00:00",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseAirtimeTime", () => {
  it("reads the offset-less timestamp as UTC", () => {
    expect(parseAirtimeTime("2026-10-20 13:00:00")?.toISOString()).toBe(
      "2026-10-20T13:00:00.000Z",
    );
  });

  it("returns null for junk", () => {
    expect(parseAirtimeTime("not a date")).toBeNull();
    expect(parseAirtimeTime(undefined)).toBeNull();
  });
});

describe("normalizeAirtimeLiveMetadata", () => {
  it("uses the current show, unescaped, as the title", () => {
    const result = normalizeAirtimeLiveMetadata("kx", {
      shows: { current: SHOW },
      tracks: { current: { name: "", type: "livestream" } },
    });

    expect(result).toMatchObject({
      stationId: "kx",
      stationLabel: "KX",
      status: "schedule",
      title: "Roots & Reggae w/ Rikette",
      starts: "2026-10-20T13:00:00.000Z",
      ends: "2026-10-20T14:00:00.000Z",
    });
    expect(result.artwork).toBeUndefined();
  });

  it("reports the default playlist when no show is on", () => {
    const result = normalizeAirtimeLiveMetadata("kx", {
      shows: { current: null },
      tracks: { current: { name: "Some Track" } },
    });

    expect(result.status).toBe("defaultPlaylist");
    expect(result.title).toBe("Some Track");
  });

  it("falls back to the station title for an unnamed playlist track", () => {
    const result = normalizeAirtimeLiveMetadata("kx", {
      shows: { current: null },
      tracks: { current: { name: "" } },
    });

    expect(result.title).toBe("Live from Voices KX");
  });

  it("reports off air when there is neither a show nor a track", () => {
    const result = normalizeAirtimeLiveMetadata("kx", {
      shows: { current: null },
      tracks: { current: null },
    });

    expect(result.status).toBe("offAir");
    expect(result.title).toBe("Station offline");
  });

  it("returns unknown metadata with no payload", () => {
    expect(normalizeAirtimeLiveMetadata("kx").status).toBe("unknown");
  });
});

describe("fetchAirtimeLiveMetadata", () => {
  it("asks Airtime for UTC and normalises the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ shows: { current: SHOW }, tracks: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAirtimeLiveMetadata("kx");

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/live-info-v2?timezone=UTC",
    );
    expect(result.title).toBe("Roots & Reggae w/ Rikette");
  });

  it("skips the Data Cache so a stale show can't stick", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ shows: { current: SHOW }, tracks: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchAirtimeLiveMetadata("kx");

    const init = fetchMock.mock.calls[0][1];
    expect(init).toMatchObject({ cache: "no-store" });
    expect(init).not.toHaveProperty("next");
  });

  it("uses the matched artist's photo as the artwork", async () => {
    vi.mocked(fetchLiveShowArtistImage).mockResolvedValueOnce(
      "https://img/rikette.jpg",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ shows: { current: SHOW }, tracks: {} }),
      }),
    );

    const result = await fetchAirtimeLiveMetadata("kx");

    expect(fetchLiveShowArtistImage).toHaveBeenCalledWith(
      "Roots & Reggae w/ Rikette",
    );
    expect(result.artwork).toBe("https://img/rikette.jpg");
  });

  it("has no artwork when no artist matches", async () => {
    vi.mocked(fetchLiveShowArtistImage).mockResolvedValueOnce(undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ shows: { current: SHOW }, tracks: {} }),
      }),
    );

    expect((await fetchAirtimeLiveMetadata("kx")).artwork).toBeUndefined();
  });

  it("does not look up an artist for a playlist track", async () => {
    vi.mocked(fetchLiveShowArtistImage).mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          shows: { current: null },
          tracks: { current: { name: "Some Track" } },
        }),
      }),
    );

    await fetchAirtimeLiveMetadata("kx");

    expect(fetchLiveShowArtistImage).not.toHaveBeenCalled();
  });

  it("throws when Airtime errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(fetchAirtimeLiveMetadata("kx")).rejects.toThrow(/503/);
  });

  it("throws on an unexpected shape rather than reporting off air", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ oops: 1 }) }),
    );

    await expect(fetchAirtimeLiveMetadata("kx")).rejects.toThrow(/shape/);
  });
});

describe("fetchAirtimeSchedule", () => {
  const entry = (instance_id: number, starts: string, ends: string) => ({
    name: `Show ${instance_id}`,
    id: 1,
    instance_id,
    starts,
    ends,
  });

  it("flattens every day key, keys events by instance_id and ignores the version", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          monday: [entry(11, "2026-10-18 23:00:00", "2026-10-19 00:00:00")],
          nexttuesday: [
            entry(22, "2026-10-27 09:00:00", "2026-10-27 10:00:00"),
          ],
          AIRTIME_API_VERSION: "1.1",
        }),
      }),
    );

    const events = await fetchAirtimeSchedule();

    expect(events).toEqual([
      {
        id: "11",
        title: "Show 11",
        startDateUtc: "2026-10-18T23:00:00.000Z",
        endDateUtc: "2026-10-19T00:00:00.000Z",
      },
      {
        id: "22",
        title: "Show 22",
        startDateUtc: "2026-10-27T09:00:00.000Z",
        endDateUtc: "2026-10-27T10:00:00.000Z",
      },
    ]);
  });

  it("drops a duplicate instance and entries with no usable start", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sunday: [entry(5, "2026-10-18 10:00:00", "2026-10-18 11:00:00")],
          monday: [
            entry(5, "2026-10-18 10:00:00", "2026-10-18 11:00:00"),
            entry(6, "garbage", "2026-10-18 11:00:00"),
          ],
        }),
      }),
    );

    const events = await fetchAirtimeSchedule();

    expect(events.map((event) => event.id)).toEqual(["5"]);
  });

  it("throws when the response has no day arrays", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ AIRTIME_API_VERSION: "1.1" }),
      }),
    );

    await expect(fetchAirtimeSchedule()).rejects.toThrow(/shape/);
  });

  it("throws when Airtime errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(fetchAirtimeSchedule()).rejects.toThrow(/500/);
  });
});
