import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VoicesArtist } from "@/lib/voices/types";

const getArtist = vi.fn();
const getShowsForArtist = vi.fn();

vi.mock("@/lib/voices/api", () => ({
  getArtist: (id: string) => getArtist(id),
  getShowsForArtist: (id: string) => getShowsForArtist(id),
}));

vi.mock("../../components/redesign/save-artist-button", () => ({
  default: ({ artistId, name }: { artistId: string; name: string }) => (
    <button type="button" data-artist-id={artistId}>
      Save {name}
    </button>
  ),
}));

vi.mock("../../components/redesign/show-grid", () => ({
  default: () => <div />,
}));
vi.mock("../../components/redesign/show-rail", () => ({
  default: () => <div />,
}));
vi.mock("../../components/redesign/supporter-block", () => ({
  default: () => <div />,
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import ArtistDetailPage from "./page";

const artist: VoicesArtist = {
  id: "artist-1",
  name: "Arnie Wrong",
  bio: "A bio.",
  genres: ["Techno"],
  aliases: [],
  featured: false,
  isActive: true,
  station: "kx",
  locationTags: [],
  socialLinks: {},
};

async function renderPage() {
  const ui = await ArtistDetailPage({
    params: Promise.resolve({ id: "artist-1" }),
  });
  return render(ui);
}

describe("ArtistDetailPage save heart", () => {
  beforeEach(() => {
    getArtist.mockReset();
    getShowsForArtist.mockReset();
    getArtist.mockResolvedValue(artist);
    getShowsForArtist.mockResolvedValue([]);
  });

  it("renders a save button in both the mobile and the desktop header", async () => {
    await renderPage();
    const buttons = screen.getAllByRole("button", { name: "Save Arnie Wrong" });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toHaveAttribute("data-artist-id", "artist-1");
    }
  });

  it("no longer renders the inert text heart", async () => {
    const { container } = await renderPage();
    expect(container.textContent).not.toContain("♡");
  });
});
