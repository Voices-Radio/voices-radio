import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLiveShowArtistImage } from "./live-show-artist";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("fetchLiveShowArtistImage", () => {
  it("asks the backend for the exact match, uncached", async () => {
    const fetchMock = stubFetch({
      ok: true,
      json: async () => ({
        artist: { id: "1", name: "Marley", imageUrl: "https://img/m.jpg" },
      }),
    });

    await expect(
      fetchLiveShowArtistImage("Swimdem Sounds w/ Marley"),
    ).resolves.toBe("https://img/m.jpg");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/artists/match-show?title=");
    expect(new URL(String(url)).searchParams.get("title")).toBe(
      "Swimdem Sounds w/ Marley",
    );
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("returns undefined when no artist matches", async () => {
    stubFetch({ ok: true, json: async () => ({ artist: null }) });
    await expect(fetchLiveShowArtistImage("Afoma V")).resolves.toBeUndefined();
  });

  it("returns undefined when the artist has no photo", async () => {
    stubFetch({
      ok: true,
      json: async () => ({ artist: { id: "1", name: "X", imageUrl: null } }),
    });
    await expect(fetchLiveShowArtistImage("X")).resolves.toBeUndefined();
  });

  it("never throws: a backend fault means no photo", async () => {
    stubFetch({ ok: false, status: 500 });
    await expect(fetchLiveShowArtistImage("X")).resolves.toBeUndefined();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(fetchLiveShowArtistImage("X")).resolves.toBeUndefined();

    stubFetch({ ok: true, json: async () => ({ artist: { imageUrl: 42 } }) });
    await expect(fetchLiveShowArtistImage("X")).resolves.toBeUndefined();
  });
});
