import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VoicesArtist } from "@/lib/voices/types";

const getArtists = vi.fn();

vi.mock("@/lib/voices/api", () => ({
  getArtists: () => getArtists(),
}));

function buildArtist(
  overrides: Partial<VoicesArtist> & Pick<VoicesArtist, "id" | "name">,
): VoicesArtist {
  return {
    bio: "",
    imageUrl: undefined,
    genres: [],
    aliases: [],
    featured: false,
    isActive: true,
    station: "kx",
    locationTags: [],
    socialLinks: {},
    ...overrides,
  } as VoicesArtist;
}

const TECHNO_KEY = "House & Techno > Techno";
const DUB_KEY = "Reggae, Dub & Dancehall > Dub";

const artists = [
  buildArtist({ id: "1", name: "Techno Host", genres: ["Techno"] }),
  buildArtist({ id: "2", name: "Jazz Host", genres: ["Jazz"] }),
  buildArtist({ id: "3", name: "Techno Dub Host", genres: ["Techno", "Dub"] }),
];

describe("ArtistsPage", () => {
  beforeEach(() => {
    getArtists.mockReset();
    getArtists.mockResolvedValue(artists);
  });

  it("links to the full-page genre browser instead of inert filter pills", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(await ArtistsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("link", { name: "Genres" })).toHaveAttribute(
      "href",
      "/artists?tab=genres",
    );
    expect(screen.queryByText("FILTERS:")).not.toBeInTheDocument();
  });

  it("renders toggle links for subgenres on the genres tab", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({ searchParams: Promise.resolve({ tab: "genres" }) }),
    );

    expect(screen.getByText("House & Techno")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Techno, not selected" }),
    ).toHaveAttribute("href", `/artists?genre=${encodeURIComponent(TECHNO_KEY)}`);
    expect(getArtists).not.toHaveBeenCalled();
  });

  it("filters artists by the selected genre and shows a removable chip", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ genre: TECHNO_KEY }),
      }),
    );

    expect(screen.getByRole("link", { name: /Techno Host/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /Jazz Host/ }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: `Remove ${TECHNO_KEY} filter` }),
    ).toHaveAttribute("href", "/artists");
    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute(
      "href",
      "/artists",
    );
  });

  it("intersects multiple selected genres (AND) and drops one on chip removal", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ genre: [TECHNO_KEY, DUB_KEY] }),
      }),
    );

    // Only the artist tagged with BOTH genres survives.
    expect(screen.getByRole("link", { name: /Techno Dub Host/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /^Techno Host/ }),
    ).not.toBeInTheDocument();

    // Removing the Dub chip leaves the Techno filter in place.
    expect(
      screen.getByRole("link", { name: `Remove ${DUB_KEY} filter` }),
    ).toHaveAttribute("href", `/artists?genre=${encodeURIComponent(TECHNO_KEY)}`);
  });

  it("explains when no artist matches the selected genre", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ genre: "Global & World" }),
      }),
    );

    expect(
      screen.getByText(/No artists match this genre yet/),
    ).toBeInTheDocument();
  });

  it("explains when no artist matches every selected genre", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({
          genre: [TECHNO_KEY, "Global & World"],
        }),
      }),
    );

    expect(
      screen.getByText(/No artists match all of these genres/),
    ).toBeInTheDocument();
  });
});
