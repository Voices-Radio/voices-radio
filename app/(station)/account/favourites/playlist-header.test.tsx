import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaylistHeader from "./playlist-header";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const LIST = { id: "list-1", name: "Late Night", showCount: 2 };

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PlaylistHeader", () => {
  it("shows the name and count", () => {
    render(<PlaylistHeader list={LIST} />);
    expect(
      screen.getByRole("heading", { name: "Late Night" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 shows/i)).toBeInTheDocument();
  });

  it("renames via PATCH and refreshes", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ list: {} }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlaylistHeader list={LIST} />);

    await user.click(screen.getByRole("button", { name: /rename/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Early Doors");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/favourites/lists/list-1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ name: "Early Doors" });
  });

  it("shows the server error when rename fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "Taken" }), { status: 409 })),
    );
    const user = userEvent.setup();
    render(<PlaylistHeader list={LIST} />);

    await user.click(screen.getByRole("button", { name: /rename/i }));
    await user.type(screen.getByRole("textbox"), "x");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Taken");
  });

  it("deletes after confirmation and returns to all favourites", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ message: "ok" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlaylistHeader list={LIST} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/account/favourites"));
    expect((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].method).toBe("DELETE");
  });

  it("does nothing when the delete confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<PlaylistHeader list={LIST} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
