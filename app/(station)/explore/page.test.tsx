import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VoicesShow } from "@/lib/voices/types";

const getShows = vi.fn();

vi.mock("@/lib/voices/api", () => ({
  getShows: (args: unknown) => getShows(args),
}));

vi.mock("../components/redesign/show-card", () => ({
  default: ({ show }: { show: VoicesShow }) => (
    <a href={`/shows/${show.id}`}>{show.title}</a>
  ),
}));

const renderPage = render;

function buildShow(
  overrides: Partial<VoicesShow> & Pick<VoicesShow, "id">,
): VoicesShow {
  return {
    title: `Show ${overrides.id}`,
    description: "",
    artwork: {
      src: `/shows/${overrides.id}.jpg`,
      alt: `Show ${overrides.id} artwork`,
      source: "show",
    },
    genres: [],
    featured: false,
    station: "unknown",
    locationTags: [],
    ...overrides,
  };
}

const TECHNO_KEY = "House & Techno > Techno";
const DUB_KEY = "Reggae, Dub & Dancehall > Dub";

const shows = [
  buildShow({ id: "1", title: "Techno Only", genres: ["Techno"] }),
  buildShow({ id: "2", title: "Techno And Dub", genres: ["Techno", "Dub"] }),
  buildShow({ id: "3", title: "Jazz Only", genres: ["Jazz"] }),
];

describe("ExplorePage", () => {
  beforeEach(() => {
    getShows.mockReset();
    getShows.mockResolvedValue(shows);
  });

  it("opens Podcast and Agency category tiles in new tabs", async () => {
    const { default: ExplorePage } = await import("./page");
    renderPage(await ExplorePage({ searchParams: Promise.resolve({}) }));

    for (const label of ["Podcast", "Agency"]) {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(getShows).not.toHaveBeenCalled();
  });

  it("shows a removable chip per selected genre and intersects them (AND)", async () => {
    const { default: ExplorePage } = await import("./page");
    renderPage(
      await ExplorePage({
        searchParams: Promise.resolve({ genre: [TECHNO_KEY, DUB_KEY] }),
      }),
    );

    expect(screen.getByRole("link", { name: /Techno And Dub/ })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /Techno Only/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Jazz Only/ }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: `Remove ${TECHNO_KEY} filter` }),
    ).toHaveAttribute(
      "href",
      `/explore?category=music&genre=${encodeURIComponent(DUB_KEY)}`,
    );
  });

  it("clears all genres back to the music browse view", async () => {
    const { default: ExplorePage } = await import("./page");
    renderPage(
      await ExplorePage({
        searchParams: Promise.resolve({ genre: TECHNO_KEY }),
      }),
    );

    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute(
      "href",
      "/explore?category=music",
    );
  });

  it("explains when nothing matches every selected genre", async () => {
    getShows.mockResolvedValue([
      buildShow({ id: "1", title: "Techno Only", genres: ["Techno"] }),
    ]);
    const { default: ExplorePage } = await import("./page");
    renderPage(
      await ExplorePage({
        searchParams: Promise.resolve({ genre: [TECHNO_KEY, DUB_KEY] }),
      }),
    );

    expect(
      screen.getByText(/No KX shows match all of these genres/),
    ).toBeInTheDocument();
  });
});
