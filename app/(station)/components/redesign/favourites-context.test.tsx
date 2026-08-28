import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { FavouritesProvider, useFavourites } from "./favourites-context";

const SIGNED_IN_USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

/** Mocks the /api/auth/session poll useSessionUser() makes internally. */
function mockSession(user: unknown) {
  return vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).includes("/api/auth/session")) {
      return new Response(JSON.stringify({ user }), { status: 200 });
    }
    return new Response(JSON.stringify({ statuses: {} }), { status: 200 });
  });
}

/** A minimal consumer that exposes context state as text for assertions. */
function Probe({ showId = "507f1f77bcf86cd799439021" }: { showId?: string }) {
  const {
    isSignedIn,
    getStatus,
    registerShowIds,
    applyStatus,
    lists,
    ensureListsLoaded,
  } = useFavourites();
  const status = getStatus(showId);

  return (
    <div>
      <span data-testid="signed-in">{String(isSignedIn)}</span>
      <span data-testid="saved">{String(status.saved)}</span>
      <span data-testid="lists">{lists ? lists.length : "null"}</span>
      <button onClick={() => registerShowIds([showId])}>register</button>
      <button
        onClick={() => applyStatus(showId, { saved: true, listIds: ["l1"] })}
      >
        apply
      </button>
      <button onClick={ensureListsLoaded}>load-lists</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FavouritesProvider — signed-out visitor", () => {
  it("reports isSignedIn: false and never fetches favourite status", async () => {
    const fetchMock = mockSession(null);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <Probe />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("signed-in")).toHaveTextContent("false"),
    );

    await user.click(screen.getByText("register"));

    // Only the session poll should have fired — never a status lookup.
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes("/api/favourites/status"),
      ),
    ).toBe(false);
  });
});

describe("FavouritesProvider — signed-in member", () => {
  it("batches every show id registered on the same mount into one GET /api/favourites/status call", async () => {
    // Mirrors the real case: a grid of ShowCards each calling
    // registerShowIds in their own mount effect. Every effect from one
    // commit runs before the queueMicrotask'd flush, so they land in a
    // single request rather than one per card.
    const fetchMock = mockSession(SIGNED_IN_USER);
    vi.stubGlobal("fetch", fetchMock);

    function RegisteringCard({ showId }: { showId: string }) {
      const { registerShowIds } = useFavourites();
      useEffect(() => {
        registerShowIds([showId]);
      }, [showId, registerShowIds]);
      return null;
    }

    render(
      <FavouritesProvider>
        <RegisteringCard showId="507f1f77bcf86cd799439021" />
        <RegisteringCard showId="507f1f77bcf86cd799439022" />
      </FavouritesProvider>,
    );

    await waitFor(() => {
      const statusCalls = fetchMock.mock.calls.filter(([input]) =>
        String(input).includes("/api/favourites/status"),
      );
      expect(statusCalls).toHaveLength(1);
    });

    const [url] = fetchMock.mock.calls.find(([input]) =>
      String(input).includes("/api/favourites/status"),
    )!;
    expect(String(url)).toContain("507f1f77bcf86cd799439021");
    expect(String(url)).toContain("507f1f77bcf86cd799439022");
  });

  it("does not re-request a show id that was already registered", async () => {
    const fetchMock = mockSession(SIGNED_IN_USER);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <Probe />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("signed-in")).toHaveTextContent("true"),
    );

    await user.click(screen.getByText("register"));
    await waitFor(() => {
      const calls = fetchMock.mock.calls.filter(([input]) =>
        String(input).includes("/api/favourites/status"),
      );
      expect(calls).toHaveLength(1);
    });

    await user.click(screen.getByText("register"));
    // Give any errant second request a chance to fire before asserting.
    await new Promise((resolve) => setTimeout(resolve, 10));

    const calls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes("/api/favourites/status"),
    );
    expect(calls).toHaveLength(1);
  });

  it("applyStatus updates getStatus immediately — the optimistic-update path", async () => {
    vi.stubGlobal("fetch", mockSession(SIGNED_IN_USER));
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <Probe />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("signed-in")).toHaveTextContent("true"),
    );
    expect(screen.getByTestId("saved")).toHaveTextContent("false");

    await user.click(screen.getByText("apply"));

    expect(screen.getByTestId("saved")).toHaveTextContent("true");
  });

  it("ensureListsLoaded fetches lists once and caches the result", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/auth/session")) {
        return new Response(JSON.stringify({ user: SIGNED_IN_USER }), {
          status: 200,
        });
      }
      if (url.includes("/api/favourites/lists")) {
        return new Response(
          JSON.stringify({
            lists: [
              {
                id: "l1",
                name: "My Favourites",
                isDefault: true,
                showCount: 0,
              },
            ],
          }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ statuses: {} }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <Probe />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("signed-in")).toHaveTextContent("true"),
    );

    await user.click(screen.getByText("load-lists"));
    await waitFor(() =>
      expect(screen.getByTestId("lists")).toHaveTextContent("1"),
    );

    await user.click(screen.getByText("load-lists"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    const listCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes("/api/favourites/lists"),
    );
    expect(listCalls).toHaveLength(1);
  });
});

describe("useFavourites", () => {
  it("throws when used outside a FavouritesProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useFavourites must be used within a FavouritesProvider",
    );
    consoleError.mockRestore();
  });
});
