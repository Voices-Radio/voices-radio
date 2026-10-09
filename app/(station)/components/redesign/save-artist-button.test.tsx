import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveArtistButton from "./save-artist-button";
import { FavouritesProvider } from "./favourites-context";
import { SessionProvider } from "./session-context";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/artists",
}));

const SIGNED_IN_USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

const ARTIST_ID = "507f1f77bcf86cd799439041";

function mockFetch({
  user,
  statuses = {},
  failToggle = false,
}: {
  user: unknown;
  statuses?: Record<string, { saved: boolean }>;
  failToggle?: boolean;
}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/auth/session")) {
      return new Response(JSON.stringify({ user }), { status: 200 });
    }
    if (url.includes("/api/favourites/artists/status")) {
      return new Response(JSON.stringify({ statuses }), { status: 200 });
    }
    if (url.includes(`/api/favourites/artists/${ARTIST_ID}`)) {
      if (failToggle) return new Response("{}", { status: 500 });
      return new Response(
        JSON.stringify({ artistId: ARTIST_ID, saved: method === "PUT" }),
        { status: 200 },
      );
    }
    return new Response(JSON.stringify({}), { status: 200 });
  });
}

function renderButton() {
  return render(
    <SessionProvider>
      <FavouritesProvider>
        <SaveArtistButton artistId={ARTIST_ID} name="Aeron Darka" />
      </FavouritesProvider>
    </SessionProvider>,
  );
}

function calls(fetchMock: ReturnType<typeof mockFetch>, method: string) {
  return fetchMock.mock.calls.filter(
    ([input, init]) =>
      String(input).includes(`/api/favourites/artists/${ARTIST_ID}`) &&
      (init as RequestInit | undefined)?.method === method,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SaveArtistButton", () => {
  it("sends a signed-out visitor to /join with the heart encoded in next, without calling the backend", async () => {
    const fetchMock = mockFetch({ user: null });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderButton();

    await user.click(
      await screen.findByRole("button", { name: /save aeron darka/i }),
    );

    expect(push).toHaveBeenCalledWith(
      `/join?next=${encodeURIComponent(`/artists?saveArtist=${ARTIST_ID}`)}`,
    );
    expect(calls(fetchMock, "PUT")).toHaveLength(0);
  });

  it("hearts an artist for a signed-in member", async () => {
    const fetchMock = mockFetch({ user: SIGNED_IN_USER });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderButton();

    await user.click(
      await screen.findByRole("button", { name: /save aeron darka/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /remove aeron darka/i }),
      ).toHaveAttribute("aria-pressed", "true"),
    );
    expect(calls(fetchMock, "PUT")).toHaveLength(1);
    expect(push).not.toHaveBeenCalled();
  });

  it("un-hearts an already hearted artist", async () => {
    const fetchMock = mockFetch({
      user: SIGNED_IN_USER,
      statuses: { [ARTIST_ID]: { saved: true } },
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderButton();

    await user.click(
      await screen.findByRole("button", { name: /remove aeron darka/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /save aeron darka/i }),
      ).toHaveAttribute("aria-pressed", "false"),
    );
    expect(calls(fetchMock, "DELETE")).toHaveLength(1);
  });

  it("rolls back when the backend rejects the toggle", async () => {
    const fetchMock = mockFetch({ user: SIGNED_IN_USER, failToggle: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderButton();

    await user.click(
      await screen.findByRole("button", { name: /save aeron darka/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /save aeron darka/i }),
      ).toHaveAttribute("aria-pressed", "false"),
    );
  });
});
