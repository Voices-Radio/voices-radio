import { beforeEach, describe, expect, it, vi } from "vitest";

// /llms.txt: a plain-text summary of the site for AI search. Carried over
// from the pre-redesign site, so it must keep listing the podcast studio and
// its location pages, and now also the redesign's own sections.
vi.mock("@/sanity.client", () => ({
  getPodcast: vi.fn(),
  getLocationPageSlugs: vi.fn(),
}));
vi.mock("@/lib/site-url", () => ({ getBaseUrl: () => "https://www.voicesradio.co.uk" }));

import { getLocationPageSlugs, getPodcast } from "@/sanity.client";
import { GET } from "./route";

const mockedPodcast = getPodcast as ReturnType<typeof vi.fn>;
const mockedSlugs = getLocationPageSlugs as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockedPodcast.mockResolvedValue(null);
  mockedSlugs.mockResolvedValue([{ slug: "kings-cross" }]);
});

describe("GET /llms.txt", () => {
  it("returns plain text", async () => {
    const res = await GET();

    expect(res.headers.get("content-type")).toMatch(/^text\/plain/);
  });

  it("lists each location page with its absolute URL", async () => {
    const body = await (await GET()).text();

    expect(body).toContain("Podcast Studio Kings Cross: https://www.voicesradio.co.uk/podcast-studio/kings-cross");
  });

  it("lists the redesign's main sections", async () => {
    const body = await (await GET()).text();

    for (const path of ["/shows", "/artists", "/explore", "/agency", "/join", "/podcast", "/blog"]) {
      expect(body).toContain(`https://www.voicesradio.co.uk${path}`);
    }
  });

  it("still answers when the location pages cannot be read", async () => {
    mockedSlugs.mockRejectedValue(new Error("sanity down"));

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("# Voices Radio");
  });
});
