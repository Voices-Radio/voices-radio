import { describe, expect, it, vi } from "vitest";
import type { VoicesShow, VoicesWebsiteRail } from "./types";

vi.mock("@/sanity.client", () => ({
  getHomePage: vi.fn(),
}));

vi.mock("@/sanity.image", () => ({
  urlForImage: vi.fn(),
}));

vi.mock("./api", () => ({
  getShowForCuration: vi.fn(),
  getWebsiteRails: vi.fn(),
}));

vi.mock("./artwork", () => ({
  enhanceArtworkUrl: vi.fn((url?: string) => url),
}));

import { getHomePage } from "@/sanity.client";
import { getWebsiteRails } from "./api";
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

function rail(
  key: string,
  shows: VoicesShow[] = [],
  title = key,
): VoicesWebsiteRail {
  return {
    key,
    title,
    description: "",
    station: "unknown",
    pagePlacement: ["home"],
    shows,
  };
}

describe("getHomePageContent", () => {
  it("removes retired home rails while preserving latest EAST fallback data", async () => {
    const latestEastShow = show("east-1");

    vi.mocked(getHomePage).mockResolvedValue(null);
    vi.mocked(getWebsiteRails).mockResolvedValue([
      rail("latest_kx", [show("kx-1")]),
      rail("latest_east", [latestEastShow]),
      rail("featured", [show("featured-1")]),
      rail("independent_label_market"),
      rail("cms-style-global", [], "Voices Global Community"),
    ]);

    const content = await getHomePageContent();

    expect(content.rails.map(({ key }) => key)).toEqual([
      "latest_kx",
      "featured",
    ]);
    expect(content.latestEast).toEqual([latestEastShow]);
  });
});
