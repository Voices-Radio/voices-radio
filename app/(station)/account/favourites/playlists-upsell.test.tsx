import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlaylistsUpsell from "./playlists-upsell";

describe("PlaylistsUpsell", () => {
  it("offers membership as the way to get playlists", () => {
    render(<PlaylistsUpsell />);
    expect(screen.getByText(/organise your favourites into playlists/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Become a member" })).toHaveAttribute("href", "/join");
  });
});
