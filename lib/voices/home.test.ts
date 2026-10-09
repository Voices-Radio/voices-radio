import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HomePage } from "@/sanity.queries";
import type { VoicesShow } from "./types";

vi.mock("@/sanity.client", () => ({
  getHomePage: vi.fn(),
}));

vi.mock("@/sanity.image", () => ({
  urlForImage: vi.fn(),
}));

vi.mock("./api", () => ({
  getShowForCuration: vi.fn(),
  getShowsForCuration: vi.fn(),
  getShows: vi.fn(),
}));

vi.mock("./artwork", () => ({
  enhanceArtworkUrl: vi.fn((url?: string) => url),
}));

import { getHomePage } from "@/sanity.client";
import { getShowForCuration, getShows, getShowsForCuration } from "./api";
import { getHomePageContent } from "./home";

function show(id: string): VoicesShow {
  return {
    id,
    title: `Show ${id}`,
    description: "",
    artwork: {
      src: `/shows/${id}.jpg`,
      alt: `Show ${id} artwork`,
      source: "show",
    },
    genres: [],
    featured: false,
    station: "unknown",
    locationTags: [],
  };
}

function pick(showId: string) {
  return { _type: "homeShowSelection" as const, _key: showId, showId };
}

function lane(
  key: string,
  title: string,
  showIds: string[],
  extra: { enabled?: boolean; description?: string } = {},
) {
  return {
    _key: key,
    title,
    key: { current: key },
    shows: showIds.map(pick),
    ...extra,
  };
}

function cms(overrides: Partial<HomePage>): HomePage {
  return { _id: "homePage", ...overrides };
}

beforeEach(() => {
  vi.mocked(getShowsForCuration).mockResolvedValue(new Map());
  vi.mocked(getShows).mockResolvedValue([show("latest-1"), show("latest-2")]);
  vi.mocked(getShowForCuration).mockImplementation(async (id: string) =>
    show(id),
  );
});

describe("getHomePageContent", () => {
  it("renders the fixed lanes with default copy when the CMS is empty", async () => {
    vi.mocked(getHomePage).mockResolvedValue(null);

    const content = await getHomePageContent();

    expect(content.latestKx.title).toBe("Latest on KX");
    expect(content.latestKx.shows.map(({ id }) => id)).toEqual([
      "latest-1",
      "latest-2",
    ]);
    expect(content.featured.title).toBe("Featured");
    expect(content.featured.shows).toEqual([]);
    expect(content.applyBanner).toEqual({
      heading: "Apply for a show!",
      mobileBody: expect.stringContaining("fastest-growing community radio"),
      ctaText: "Apply for a show",
    });
    expect(content.swimlanes).toEqual([]);
    expect(content.hasCmsHomePage).toBe(false);
  });

  it("fills Latest on KX automatically, never from the CMS", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        latestKxLane: {
          title: "New on KX",
          description: "Fresh from the desk",
        },
      }),
    );

    const content = await getHomePageContent();

    expect(content.latestKx.title).toBe("New on KX");
    expect(content.latestKx.description).toBe("Fresh from the desk");
    expect(content.latestKx.shows.map(({ id }) => id)).toEqual([
      "latest-1",
      "latest-2",
    ]);
  });

  it("builds Featured from the hand-picked shows in CMS order, skipping duplicates", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        featuredLane: {
          title: "Staff Favourites",
          shows: [pick("b"), pick("a"), pick("b")],
        },
      }),
    );

    const content = await getHomePageContent();

    expect(content.featured.title).toBe("Staff Favourites");
    expect(content.featured.shows.map(({ id }) => id)).toEqual(["b", "a"]);
  });

  it("hydrates curated shows with one bulk request, falling back per show only for misses", async () => {
    vi.mocked(getShowsForCuration).mockResolvedValue(
      new Map([
        ["a", show("a")],
        ["b", show("b")],
      ]),
    );
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        featuredLane: {
          title: "Staff Favourites",
          shows: [pick("a"), pick("b"), pick("missing")],
        },
      }),
    );

    const content = await getHomePageContent();

    expect(content.featured.shows.map(({ id }) => id)).toEqual([
      "a",
      "b",
      "missing",
    ]);
    // Only the show the bulk call could not resolve hits the per-show path.
    expect(getShowForCuration).toHaveBeenCalledWith("missing");
    expect(getShowForCuration).not.toHaveBeenCalledWith("a");
    expect(getShowForCuration).not.toHaveBeenCalledWith("b");
  });

  it("uses an image override on a featured pick", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        featuredLane: {
          shows: [
            {
              _type: "homeRailShow",
              _key: "k1",
              show: { _type: "homeShowSelection", showId: "a" },
              image: { asset: { _id: "i", url: "https://cdn/override.jpg" } },
            },
          ],
        },
      }),
    );

    const content = await getHomePageContent();

    expect(content.featured.shows[0].artwork.src).toBe(
      "https://cdn/override.jpg",
    );
  });

  it("renders any number of swimlanes in CMS order, hiding disabled and empty ones", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        showRails: [
          lane("producer-picks", "Producer Picks", ["p1"]),
          lane("hidden", "Hidden", ["h1"], { enabled: false }),
          lane("empty", "Empty", []),
          lane("october", "October Highlights", ["o1", "o2"], {
            description: "The best of the month",
          }),
        ],
      }),
    );

    const content = await getHomePageContent();

    expect(content.swimlanes.map(({ title }) => title)).toEqual([
      "Producer Picks",
      "October Highlights",
    ]);
    expect(content.swimlanes[1].description).toBe("The best of the month");
    expect(content.swimlanes[1].shows.map(({ id }) => id)).toEqual([
      "o1",
      "o2",
    ]);
  });

  it("supports zero swimlanes and many swimlanes without moving the fixed lanes", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        showRails: ["a", "b", "c", "d"].map((key) =>
          lane(key, `Lane ${key}`, [`${key}-1`]),
        ),
      }),
    );

    const content = await getHomePageContent();

    expect(content.swimlanes).toHaveLength(4);
    expect(content.latestKx.title).toBe("Latest on KX");
    expect(content.featured.title).toBe("Featured");
  });

  it("drops shows that can no longer be resolved", async () => {
    vi.mocked(getShowForCuration).mockImplementation(async (id: string) => {
      if (id === "gone") throw new Error("404");
      return show(id);
    });
    vi.mocked(getHomePage).mockResolvedValue(
      cms({ showRails: [lane("picks", "Picks", ["gone", "ok"])] }),
    );

    const content = await getHomePageContent();

    expect(content.swimlanes[0].shows.map(({ id }) => id)).toEqual(["ok"]);
  });

  it("lets editors change the Apply banner copy", async () => {
    vi.mocked(getHomePage).mockResolvedValue(
      cms({
        applyBanner: { heading: "Got a show idea?", ctaText: "Pitch it" },
      }),
    );

    const content = await getHomePageContent();

    expect(content.applyBanner.heading).toBe("Got a show idea?");
    expect(content.applyBanner.ctaText).toBe("Pitch it");
    expect(content.applyBanner.mobileBody).toContain("community radio");
  });

  it("falls back to the latest shows for the feature panel when none are curated", async () => {
    vi.mocked(getHomePage).mockResolvedValue(null);

    const content = await getHomePageContent();

    expect(content.featuredItems.map(({ id }) => id)).toEqual([
      "show-latest-1",
      "show-latest-2",
    ]);
  });
});
