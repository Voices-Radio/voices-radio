import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/favourites/client", () => ({
  getFavouriteLists: vi.fn(async () => ({
    ok: true,
    data: [
      { id: "house", name: "House", isDefault: false, showCount: 1 },
      { id: "jazz", name: "Jazz", isDefault: false, showCount: 1 },
    ],
  })),
  getFavourites: vi.fn(async ({ listId }: { listId?: string }) => ({
    ok: true,
    data: {
      favourites: [{ show: { id: `${listId}-show`, title: `${listId} show` } }],
      nextCursor: null,
    },
  })),
}));
vi.mock("@/lib/voices/membership/session", () => ({
  lookupCapabilities: vi.fn(async () => ({ ok: true, data: { member: true } })),
}));
vi.mock("@/lib/voices/membership/capabilities", () => ({
  canOrganisePlaylists: () => true,
}));
vi.mock("../components/account-surface", () => ({ AccountPageIntro: () => null }));
vi.mock("./new-playlist-form", () => ({ default: () => null }));
vi.mock("./favourites-list-nav", () => ({ default: () => null }));
vi.mock("./playlist-header", () => ({ default: () => null }));
vi.mock("../../components/redesign/show-grid", () => ({
  default: ({ shows }: { shows: Array<{ id: string; title: string }> }) => (
    <ul>
      {shows.map((show) => (
        <li key={show.id}>{show.title}</li>
      ))}
    </ul>
  ),
}));

const { default: FavouritesPage } = await import("./page");

function pageFor(list: string) {
  return FavouritesPage({ searchParams: Promise.resolve({ list }) });
}

describe("FavouritesPage", () => {
  it("shows the new playlist's shows after switching between two non-empty playlists", async () => {
    const { rerender } = render(await pageFor("house"));
    expect(screen.getByText("house show")).toBeInTheDocument();

    // Client navigation re-renders the same tree with new props.
    rerender(await pageFor("jazz"));

    expect(screen.getByText("jazz show")).toBeInTheDocument();
    expect(screen.queryByText("house show")).not.toBeInTheDocument();
  });
});
