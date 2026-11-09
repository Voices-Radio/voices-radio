import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FavouritesListNav from "./favourites-list-nav";

const DEFAULT_LIST = {
  id: "list-default",
  name: "My Favourites",
  isDefault: true,
  showCount: 4,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};
const CUSTOM_LIST = {
  id: "list-custom",
  name: "Late Night",
  isDefault: false,
  showCount: 2,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("FavouritesListNav", () => {
  it("renders an All chip plus one chip per list, with counts", () => {
    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} />);

    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
      "href",
      "/account/favourites",
    );
    expect(
      screen.getByRole("link", { name: /my favourites/i }),
    ).toHaveAttribute("href", `/account/favourites?list=${DEFAULT_LIST.id}`);
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("marks the active list's chip and offers no delete controls", () => {
    render(
      <FavouritesListNav
        lists={[DEFAULT_LIST, CUSTOM_LIST]}
        activeListId={CUSTOM_LIST.id}
      />,
    );
    expect(screen.getByRole("link", { name: /late night/i }).className).toMatch(
      /bg-voicesNext-orange/,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
