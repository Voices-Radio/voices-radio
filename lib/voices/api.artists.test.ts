import { afterEach, describe, expect, it, vi } from "vitest";
import { getArtists } from "./api";

function rawArtist(n: number) {
  return { _id: `a${n}`, name: `Artist ${n}`, isActive: true, genres: [] };
}

function pageBody(page: number, pages: number, ids: number[]) {
  return {
    items: ids.map(rawArtist),
    pagination: { page, limit: 100, total: 139, pages },
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const range = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => start + i);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getArtists", () => {
  it("pages through the optimized endpoint at the max page size and returns every artist", async () => {
    const fetchMock = vi.fn((url: URL) => {
      const page = Number(url.searchParams.get("page"));
      return Promise.resolve(
        jsonResponse(
          page === 1
            ? pageBody(1, 2, range(1, 100))
            : pageBody(2, 2, range(101, 39)),
        ),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const artists = await getArtists();

    expect(artists).toHaveLength(139);
    expect(artists.map((artist) => artist.id)).toContain("a139");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const requested = fetchMock.mock.calls.map(([url]) => url);
    expect(requested.every((url) => url.pathname === "/api/artists/optimized")).toBe(true);
    expect(requested.map((url) => url.searchParams.get("limit"))).toEqual([
      "100",
      "100",
    ]);
    expect(requested.map((url) => url.searchParams.get("page"))).toEqual([
      "1",
      "2",
    ]);
  });

  it("makes a single request when the first page holds everything", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(jsonResponse(pageBody(1, 1, range(1, 5)))),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getArtists()).resolves.toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("accepts a plain-array response without paging", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(jsonResponse([rawArtist(1), rawArtist(2)])),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getArtists()).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when a page request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("", { status: 500 }))),
    );

    await expect(getArtists()).rejects.toThrow(
      "Voices API request failed: 500",
    );
  });
});
