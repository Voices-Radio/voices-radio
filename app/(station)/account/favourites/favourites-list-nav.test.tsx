import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavouritesListNav from "./favourites-list-nav";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

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

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

  it("never offers a delete control for the default list", () => {
    render(<FavouritesListNav lists={[DEFAULT_LIST]} />);
    expect(
      screen.queryByRole("button", { name: /delete list my favourites/i }),
    ).not.toBeInTheDocument();
  });

  it("offers a delete control for a custom list", () => {
    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} />);
    expect(
      screen.getByRole("button", { name: /delete list late night/i }),
    ).toBeInTheDocument();
  });

  it("does nothing when the confirm dialog is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} />);
    await user.click(screen.getByRole("button", { name: /delete list late night/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("deletes the list and refreshes the page when confirmed, while staying off the deleted list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: "List deleted" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} activeListId={undefined} />);
    await user.click(screen.getByRole("button", { name: /delete list late night/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/favourites/lists/${CUSTOM_LIST.id}`,
        { method: "DELETE" },
      ),
    );
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates back to the unfiltered view when the currently active list is deleted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "List deleted" }), { status: 200 })),
    );
    const user = userEvent.setup();

    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} activeListId={CUSTOM_LIST.id} />);
    await user.click(screen.getByRole("button", { name: /delete list late night/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/account/favourites"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows a visible error and does not navigate when the delete request fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "Server error" }), { status: 500 })),
    );
    const user = userEvent.setup();

    render(<FavouritesListNav lists={[DEFAULT_LIST, CUSTOM_LIST]} />);
    await user.click(screen.getByRole("button", { name: /delete list late night/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Server error");
    expect(refresh).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
