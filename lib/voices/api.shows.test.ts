import { afterEach, describe, expect, it, vi } from "vitest";
import { getShowsForArtist } from "./api";

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
