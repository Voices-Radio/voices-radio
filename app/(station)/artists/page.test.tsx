import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VoicesArtist } from "@/lib/voices/types";

const getArtists = vi.fn();

vi.mock("@/lib/voices/api", () => ({
  getArtists: () => getArtists(),
}));

// The heart needs the shell's FavouritesProvider; it's covered by its own tests.
vi.mock("../components/redesign/save-artist-button", () => ({
  default: () => null,
}));

// The search field reads the router; it is covered by its own tests.
vi.mock("../components/redesign/artist-search-field", () => ({
  default: () => <div data-testid="artist-search-field" />,
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
  buildArtist({
    id: "4",
    name: "Station East Host",
    station: "east",
    aliases: ["Hackney Selector"],
  }),
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

  it("renders the search field on the artists tab but not on the genres tab", async () => {
    const { default: ArtistsPage } = await import("./page");
    const { unmount } = render(
      await ArtistsPage({ searchParams: Promise.resolve({}) }),
    );
    expect(screen.getByTestId("artist-search-field")).toBeInTheDocument();
    unmount();

    render(
      await ArtistsPage({ searchParams: Promise.resolve({ tab: "genres" }) }),
    );
    expect(screen.queryByTestId("artist-search-field")).not.toBeInTheDocument();
  });

  it("filters artists by name from the q param", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({ searchParams: Promise.resolve({ q: "jazz" }) }),
    );

    expect(screen.getByRole("link", { name: /Jazz Host/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /Techno Host/ }),
    ).not.toBeInTheDocument();
  });

  it("matches aliases and shows matches from every station in one list", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({ searchParams: Promise.resolve({ q: "hackney" }) }),
    );

    expect(
      screen.getByRole("link", { name: /Station East Host/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Voices KX" }),
    ).not.toBeInTheDocument();
  });

  it("combines q with a selected genre", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ genre: TECHNO_KEY, q: "dub" }),
      }),
    );

    expect(screen.getByRole("link", { name: /Techno Dub Host/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /^Techno Host/ }),
    ).not.toBeInTheDocument();
    // Removing the genre chip keeps the search.
    expect(
      screen.getByRole("link", { name: `Remove ${TECHNO_KEY} filter` }),
    ).toHaveAttribute("href", "/artists?q=dub");
  });

  it("explains when no artist matches the search and links to clear it", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({ searchParams: Promise.resolve({ q: "zzzz" }) }),
    );

    expect(screen.getByText(/No artists match/)).toHaveTextContent("zzzz");
    expect(
      screen.getByRole("link", { name: "Clear search" }),
    ).toHaveAttribute("href", "/artists");
  });

  describe("load more", () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      buildArtist({ id: `m${i}`, name: `Many ${String(i).padStart(2, "0")}` }),
    );

    it("collapses to 9 behind a button, not a navigating link", async () => {
      getArtists.mockResolvedValue(many);
      const { default: ArtistsPage } = await import("./page");
      render(await ArtistsPage({ searchParams: Promise.resolve({}) }));

      expect(screen.getAllByRole("link", { name: /^Open Many/ })).toHaveLength(9);
      expect(
        screen.getByRole("button", { name: /load more \(21 left\)/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Load More" }),
      ).not.toBeInTheDocument();
    });

    it("still shows every artist for a shared ?expand=all link", async () => {
      getArtists.mockResolvedValue(many);
      const { default: ArtistsPage } = await import("./page");
      render(
        await ArtistsPage({ searchParams: Promise.resolve({ expand: "all" }) }),
      );

      expect(screen.getAllByRole("link", { name: /^Open Many/ })).toHaveLength(30);
      expect(
        screen.queryByRole("button", { name: /load more/i }),
      ).not.toBeInTheDocument();
    });
  });
});
