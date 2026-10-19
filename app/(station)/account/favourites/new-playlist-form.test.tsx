import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewPlaylistForm from "./new-playlist-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

async function openForm() {
  const user = userEvent.setup();
  render(<NewPlaylistForm />);
  await user.click(screen.getByRole("button", { name: /new playlist/i }));
  return user;
}

describe("NewPlaylistForm", () => {
  it("starts collapsed behind a New playlist button", () => {
    render(<NewPlaylistForm />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new playlist/i }),
    ).toBeInTheDocument();
  });

  it("creates the playlist with a trimmed name and opens it", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ list: { id: "list-new", name: "Jazz" } }), {
          status: 201,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = await openForm();

    await user.type(screen.getByRole("textbox"), "  Jazz  ");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/account/favourites?list=list-new"),
    );
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/favourites/lists");
    expect(JSON.parse(init.body as string)).toEqual({ name: "Jazz" });
  });

  it("shows the server's message and stays put when creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: "You already have a list called that" }), {
            status: 409,
          }),
      ),
    );
    const user = await openForm();

    await user.type(screen.getByRole("textbox"), "Jazz");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already have/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("disables Create until there is a name", async () => {
    await openForm();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
