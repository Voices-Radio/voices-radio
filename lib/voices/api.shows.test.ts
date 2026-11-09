import { afterEach, describe, expect, it, vi } from "vitest";
import { getShows, getShowsForArtist, getShowsForCuration } from "./api";

const ARTIST_ID = "686c1b20fa25d315f33f61cc";

function rawShow(id: string, artistId: string | null) {
  return {
    _id: id,
    title: `Show ${id}`,
    date: "2026-09-01T00:00:00.000Z",
    matching_status: "matched",
    ...(artistId ? { artistId } : {}),
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Mirrors GET /api/shows in voices_backend: it filters on `artistId` only and
// silently ignores any other param, returning the latest shows for everyone.
function backendShowsMock() {
  return vi.fn((url: URL) => {
    const artistId = url.searchParams.get("artistId");
    return Promise.resolve(
      jsonResponse(
        artistId
          ? [rawShow("own-1", artistId), rawShow("own-2", artistId)]
          : [rawShow("other-1", null), rawShow("other-2", "someone-else")],
      ),
    );
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getShowsForArtist", () => {
  it("filters /api/shows by the artistId param the backend reads", async () => {
    const fetchMock = backendShowsMock();
    vi.stubGlobal("fetch", fetchMock);

    await getShowsForArtist(ARTIST_ID);

    const [url] = fetchMock.mock.calls[0];
    expect(url.pathname).toBe("/api/shows");
    expect(url.searchParams.get("artistId")).toBe(ARTIST_ID);
    expect(url.searchParams.has("artist")).toBe(false);
  });

  it("returns only that artist's shows", async () => {
    vi.stubGlobal("fetch", backendShowsMock());

    const shows = await getShowsForArtist(ARTIST_ID);

    expect(shows.map((show) => show.id)).toEqual(["own-1", "own-2"]);
  });
});

describe("artist embedding and bulk curation fetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not fetch artists for shows the backend already embedded", async () => {
    const fetchMock = vi.fn((url: URL) =>
      Promise.resolve(
        jsonResponse([
          {
            ...rawShow("s1", null),
            artistId: {
              _id: "art-1",
              name: "DJ One",
              imageUrl: "https://x/y.jpg",
            },
          },
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const shows = await getShows({ limit: 1 });

    expect(shows[0].artist?.name).toBe("DJ One");
    // Exactly one request: the list. No GET /api/artists/:id follow-up.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still joins artists for shows whose artistId came back as a bare id", async () => {
    const fetchMock = vi.fn((url: URL) =>
      Promise.resolve(
        jsonResponse(
          url.pathname === "/api/shows"
            ? [rawShow("s1", ARTIST_ID)]
            : { _id: ARTIST_ID, name: "Joined", genres: [] },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const shows = await getShows({ limit: 1 });

    expect(shows[0].artist?.name).toBe("Joined");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("getShowsForCuration sends one ?ids= request and ignores shows it did not ask for", async () => {
    // An older backend ignores `ids` and returns the latest shows instead.
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse([
          {
            ...rawShow("want", null),
            artistId: { _id: "a", name: "A" },
          },
          {
            ...rawShow("unrelated", null),
            artistId: { _id: "b", name: "B" },
          },
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const found = await getShowsForCuration(["want", "want", "gone"]);

    expect([...found.keys()]).toEqual(["want"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = (fetchMock.mock.calls[0] as unknown as [URL])[0];
    expect(url.searchParams.get("ids")).toBe("want,gone");
  });
});

describe("missing records versus backend faults", () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (status: number) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("{}", { status }))),
    );

  const VALID_ID = "686c1b20fa25d315f33f61cc";

  it.each([400, 404])(
    "getShow returns null on %i so the page can 404",
    async (status) => {
      respond(status);
      const { getShow } = await import("./api");
      expect(await getShow(VALID_ID)).toBeNull();
    },
  );

  it("rejects a malformed id without calling the backend (which would 500)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { getShow, getArtist } = await import("./api");

    expect(await getShow("definitely-not-an-id")).toBeNull();
    expect(await getArtist("definitely-not-an-id")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getShow throws on a 5xx, so a backend blip is never cached as a 404", async () => {
    respond(503);
    const { getShow } = await import("./api");
    await expect(getShow(VALID_ID)).rejects.toThrow("503");
  });

  it("getArtist returns null on 404 and throws on 500", async () => {
    const { getArtist } = await import("./api");
    respond(404);
    expect(await getArtist(VALID_ID)).toBeNull();
    respond(500);
    await expect(getArtist(VALID_ID)).rejects.toThrow("500");
  });
});
