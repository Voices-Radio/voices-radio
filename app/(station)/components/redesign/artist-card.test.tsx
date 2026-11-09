import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VoicesArtist } from "@/lib/voices/types";
import ArtistCard from "./artist-card";

vi.mock("./save-artist-button", () => ({
  default: ({ artistId, name }: { artistId: string; name: string }) => (
    <button type="button" data-testid="heart" data-artist={artistId}>
      Save {name}
    </button>
  ),
}));

const artist = {
  id: "a1",
  name: "Aeron Darka",
  bio: "",
  imageUrl: undefined,
  genres: ["Dancehall", "Disco", "Garage", "Garage (UKG)", "Extra"],
  aliases: [],
  featured: false,
  isActive: true,
  station: "kx",
  locationTags: ["london"],
  socialLinks: {},
} as unknown as VoicesArtist;

describe("ArtistCard", () => {
  it("no longer shows the station / location header strip", () => {
    render(<ArtistCard artist={artist} />);
    expect(screen.queryByText(/resident/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/london/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^kx$/i)).not.toBeInTheDocument();
  });

  it("links to the artist page and renders the heart as a sibling, not inside the link", () => {
    render(<ArtistCard artist={artist} />);
    const link = screen.getByRole("link", { name: "Open Aeron Darka" });
    expect(link).toHaveAttribute("href", "/artists/a1");
    const heart = screen.getByTestId("heart");
    expect(heart).toHaveAttribute("data-artist", "a1");
    expect(link.contains(heart)).toBe(false);
  });

  it("shows at most four genres on the same row as the heart", () => {
    render(<ArtistCard artist={artist} />);
    expect(screen.getByText("Dancehall")).toBeInTheDocument();
    expect(screen.getByText("Garage (UKG)")).toBeInTheDocument();
    expect(screen.queryByText("Extra")).not.toBeInTheDocument();
    const row = screen.getByTestId("heart").parentElement!;
    expect(row).toContainElement(screen.getByText("Dancehall"));
  });
});
