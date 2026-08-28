import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveShowButton from "./save-show-button";
import { FavouritesProvider } from "./favourites-context";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/shows",
}));

const SIGNED_IN_USER = {
  _id: "user-1",
  email: "jack@example.com",
  firstName: "Jack",
  lastName: "Onslow",
};

const SHOW_ID = "507f1f77bcf86cd799439021";

function mockFetch({
  user,
  statuses = {},
}: {
  user: unknown;
  statuses?: Record<string, { saved: boolean; listIds: string[] }>;
}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/auth/session")) {
      return new Response(JSON.stringify({ user }), { status: 200 });
    }
    if (url.includes("/api/favourites/status")) {
      return new Response(JSON.stringify({ statuses }), { status: 200 });
    }
    if (url.includes(`/api/favourites/${SHOW_ID}`) && method === "PUT") {
      return new Response(
        JSON.stringify({ showId: SHOW_ID, listIds: ["default-list"] }),
        { status: 200 },
      );
    }
    return new Response(JSON.stringify({}), { status: 200 });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SaveShowButton — signed out", () => {
  it("routes to /sign-in with a next carrying the save intent, and never calls the backend", async () => {
    const fetchMock = mockFetch({ user: null });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <SaveShowButton showId={SHOW_ID} title="Late Night Sessions" />
      </FavouritesProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /save late night sessions/i,
    });
    await user.click(button);

    expect(push).toHaveBeenCalledWith(
      `/sign-in?next=${encodeURIComponent(`/shows?save=${SHOW_ID}`)}`,
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).includes(`/api/favourites/${SHOW_ID}`) &&
          (init as RequestInit | undefined)?.method === "PUT",
      ),
    ).toBe(false);
  });
});

describe("SaveShowButton — signed in, not yet saved", () => {
  it("saves straight to the default list on a single click, optimistically then with the server result", async () => {
    const fetchMock = mockFetch({ user: SIGNED_IN_USER });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <SaveShowButton showId={SHOW_ID} title="Late Night Sessions" />
      </FavouritesProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /save late night sessions/i,
    });
    await user.click(button);

    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));

    const putCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input) === `/api/favourites/${SHOW_ID}` &&
        (init as RequestInit).method === "PUT",
    );
    expect(putCall).toBeDefined();
    expect(JSON.parse((putCall![1] as RequestInit).body as string)).toEqual({
      listIds: [],
    });
  });

  it("rolls the optimistic update back when the save request fails", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/api/auth/session")) {
          return new Response(JSON.stringify({ user: SIGNED_IN_USER }), {
            status: 200,
          });
        }
        if (url.includes("/api/favourites/status")) {
          return new Response(JSON.stringify({ statuses: {} }), {
            status: 200,
          });
        }
        if (url === `/api/favourites/${SHOW_ID}` && init?.method === "PUT") {
          return new Response(JSON.stringify({ message: "nope" }), {
            status: 500,
          });
        }
        return new Response(JSON.stringify({}), { status: 200 });
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <SaveShowButton showId={SHOW_ID} title="Late Night Sessions" />
      </FavouritesProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /save late night sessions/i,
    });
    await user.click(button);

    // Rolls back to unsaved once the PUT rejects.
    await waitFor(() =>
      expect(button).toHaveAttribute("aria-pressed", "false"),
    );
  });
});

describe("SaveShowButton — hover affordance", () => {
  it("lights the bookmark icon up on hover/focus via a scoped named group", async () => {
    const fetchMock = mockFetch({ user: null });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavouritesProvider>
        <SaveShowButton showId={SHOW_ID} title="Late Night Sessions" />
      </FavouritesProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /save late night sessions/i,
    });
    const icon = button.querySelector("svg");

    // Named group, not the bare `group` ShowCard's own hover already
    // claims — this button's icon must react to *its own* hover/focus only.
    expect(button.className).toMatch(/\bgroup\/save\b/);
    expect(icon?.getAttribute("class")).toMatch(
      /group-hover\/save:text-voicesNext-orange/,
    );
    expect(icon?.getAttribute("class")).toMatch(
      /group-hover\/save:drop-shadow-/,
    );
  });
});

describe("SaveShowButton — signed in, already saved", () => {
  it("opens the list picker instead of toggling straight off", async () => {
    const fetchMock = mockFetch({
      user: SIGNED_IN_USER,
      statuses: { [SHOW_ID]: { saved: true, listIds: ["default-list"] } },
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <FavouritesProvider>
        <SaveShowButton showId={SHOW_ID} title="Late Night Sessions" />
      </FavouritesProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /manage lists for late night sessions/i,
    });
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);

    expect(
      await screen.findByRole("dialog", { name: /save to/i }),
    ).toBeInTheDocument();
    // Clicking again must never have fired a DELETE — only the sheet
    // (which the user hasn't acted on yet) can remove a saved show.
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === `/api/favourites/${SHOW_ID}` &&
          (init as RequestInit | undefined)?.method === "DELETE",
      ),
    ).toBe(false);
  });
});
