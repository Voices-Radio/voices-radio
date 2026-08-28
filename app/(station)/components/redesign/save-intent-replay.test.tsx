import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SaveIntentReplay from "./save-intent-replay";
import { FavouritesProvider } from "./favourites-context";

const replace = vi.fn();
let searchParamsString = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/shows",
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

const SIGNED_IN_USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

const VALID_SHOW_ID = "507f1f77bcf86cd799439021";

function mockFetch(user: unknown, putStatus = 200) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/api/auth/session")) {
      return new Response(JSON.stringify({ user }), { status: 200 });
    }
    if (url.includes("/api/favourites/status")) {
      return new Response(JSON.stringify({ statuses: {} }), { status: 200 });
    }
    if (url === `/api/favourites/${VALID_SHOW_ID}` && init?.method === "PUT") {
      return putStatus === 200
        ? new Response(
            JSON.stringify({ showId: VALID_SHOW_ID, listIds: ["default"] }),
            { status: 200 },
          )
        : new Response(JSON.stringify({ message: "nope" }), { status: 500 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  searchParamsString = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SaveIntentReplay", () => {
  it("does nothing when there is no save param", async () => {
    searchParamsString = "";
    const fetchMock = mockFetch(SIGNED_IN_USER);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavouritesProvider>
        <SaveIntentReplay />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("/api/auth/session"),
        ),
      ).toBe(true),
    );

    expect(
      fetchMock.mock.calls.some(
        ([input, init]) => (init as RequestInit | undefined)?.method === "PUT",
      ),
    ).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it("rejects a malformed save id — never sends it to the backend", async () => {
    searchParamsString = "save=not-an-object-id";
    const fetchMock = mockFetch(SIGNED_IN_USER);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavouritesProvider>
        <SaveIntentReplay />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("/api/auth/session"),
        ),
      ).toBe(true),
    );

    expect(
      fetchMock.mock.calls.some(
        ([input, init]) => (init as RequestInit | undefined)?.method === "PUT",
      ),
    ).toBe(false);
  });

  it("waits for sign-in to resolve before replaying — never fires while signed out", async () => {
    searchParamsString = `save=${VALID_SHOW_ID}`;
    const fetchMock = mockFetch(null);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavouritesProvider>
        <SaveIntentReplay />
      </FavouritesProvider>,
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([input]) =>
          String(input).includes("/api/auth/session"),
        ),
      ).toBe(true),
    );

    expect(
      fetchMock.mock.calls.some(
        ([input, init]) => (init as RequestInit | undefined)?.method === "PUT",
      ),
    ).toBe(false);
  });

  it("replays a valid save, shows a visible confirmation, and strips the param", async () => {
    searchParamsString = `save=${VALID_SHOW_ID}&station=kx`;
    const fetchMock = mockFetch(SIGNED_IN_USER);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavouritesProvider>
        <SaveIntentReplay />
      </FavouritesProvider>,
    );

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find(
        ([input, init]) =>
          String(input) === `/api/favourites/${VALID_SHOW_ID}` &&
          (init as RequestInit | undefined)?.method === "PUT",
      );
      expect(putCall).toBeDefined();
    });

    // Never re-adds a listId from the URL — this route only ever saves to
    // the caller's default list.
    const [, init] = fetchMock.mock.calls.find(
      ([input, reqInit]) =>
        String(input) === `/api/favourites/${VALID_SHOW_ID}` &&
        (reqInit as RequestInit | undefined)?.method === "PUT",
    )!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ listIds: [] });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Saved to My Favourites",
    );

    // The intent param is stripped, but the rest of the query survives.
    expect(replace).toHaveBeenCalledWith("/shows?station=kx", { scroll: false });
  });

  it("shows a visible error when the replayed save fails, rather than failing silently", async () => {
    searchParamsString = `save=${VALID_SHOW_ID}`;
    vi.stubGlobal("fetch", mockFetch(SIGNED_IN_USER, 500));

    render(
      <FavouritesProvider>
        <SaveIntentReplay />
      </FavouritesProvider>,
    );

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(/couldn't save/i);
  });
});
