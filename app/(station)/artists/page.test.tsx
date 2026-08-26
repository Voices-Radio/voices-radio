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

const artists = [
  buildArtist({ id: "1", name: "Techno Host", genres: ["Techno"] }),
  buildArtist({ id: "2", name: "Jazz Host", genres: ["Jazz"] }),
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

  it("renders the genre browser with subgenre links on the genres tab", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({ searchParams: Promise.resolve({ tab: "genres" }) }),
    );

    expect(screen.getByText("House & Techno")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Techno" })).toHaveAttribute(
      "href",
      `/artists?genre=${encodeURIComponent("House & Techno > Techno")}`,
    );
    expect(getArtists).not.toHaveBeenCalled();
  });

  it("filters artists by the selected genre key", async () => {
    const { default: ArtistsPage } = await import("./page");
    render(
      await ArtistsPage({
        searchParams: Promise.resolve({ genre: "House & Techno > Techno" }),
      }),
    );

    expect(screen.getByRole("link", { name: /Techno Host/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /Jazz Host/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Change genre" })).toHaveAttribute(
      "href",
      "/artists?tab=genres",
    );
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
});
