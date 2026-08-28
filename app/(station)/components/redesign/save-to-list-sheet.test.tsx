import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import SaveToListSheet from "./save-to-list-sheet";
import { FavouritesProvider } from "./favourites-context";

const SHOW_ID = "507f1f77bcf86cd799439021";
const DEFAULT_LIST = {
  id: "list-default",
  name: "My Favourites",
  isDefault: true,
  showCount: 3,
};
const CUSTOM_LIST = {
  id: "list-custom",
  name: "Late Night",
  isDefault: false,
  showCount: 1,
};

function mockFetch({
  putStatus = 200,
  postListStatus = 201,
}: { putStatus?: number; postListStatus?: number } = {}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/auth/session")) {
      return new Response(JSON.stringify({ user: { _id: "u1" } }), { status: 200 });
    }
    if (url.includes("/api/favourites/status")) {
      return new Response(JSON.stringify({ statuses: {} }), { status: 200 });
    }
    if (url === "/api/favourites/lists" && method === "GET") {
      return new Response(
        JSON.stringify({ lists: [DEFAULT_LIST, CUSTOM_LIST] }),
        { status: 200 },
      );
    }
    if (url === "/api/favourites/lists" && method === "POST") {
      const body = JSON.parse((init?.body as string) ?? "{}");
      return postListStatus === 201
        ? new Response(
            JSON.stringify({
              list: { id: "list-new", name: body.name, isDefault: false, showCount: 0 },
            }),
            { status: 201 },
          )
        : new Response(JSON.stringify({ message: "nope" }), { status: 400 });
    }
    if (url === `/api/favourites/${SHOW_ID}` && method === "PUT") {
      const body = JSON.parse((init?.body as string) ?? "{}");
      return putStatus === 200
        ? new Response(
            JSON.stringify({ showId: SHOW_ID, listIds: body.listIds }),
            { status: 200 },
          )
        : new Response(JSON.stringify({ message: "nope" }), { status: 500 });
    }
    if (url === `/api/favourites/${SHOW_ID}` && method === "DELETE") {
      return new Response(JSON.stringify({ message: "removed" }), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  });
}

function Harness({
  listIds,
  onChange,
}: {
  listIds: string[];
  onChange: (listIds: string[]) => void;
}) {
  const triggerRef = createRef<HTMLButtonElement>();
  return (
    <FavouritesProvider>
      <button ref={triggerRef}>trigger</button>
      <SaveToListSheet
        open
        onOpenChange={() => {}}
        showId={SHOW_ID}
        title="Late Night Sessions"
        listIds={listIds}
        onListIdsChange={onChange}
        triggerRef={triggerRef}
      />
    </FavouritesProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SaveToListSheet", () => {
  it("loads and renders the caller's lists with their current membership checked", async () => {
    vi.stubGlobal("fetch", mockFetch());
    render(<Harness listIds={[DEFAULT_LIST.id]} onChange={vi.fn()} />);

    const defaultCheckbox = await screen.findByRole("checkbox", {
      name: /my favourites/i,
    });
    const customCheckbox = await screen.findByRole("checkbox", {
      name: /late night/i,
    });

    expect(defaultCheckbox).toBeChecked();
    expect(customCheckbox).not.toBeChecked();
  });

  it("saves the checked lists via PUT when at least one remains checked", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Harness listIds={[DEFAULT_LIST.id]} onChange={onChange} />);

    const customCheckbox = await screen.findByRole("checkbox", {
      name: /late night/i,
    });
    await user.click(customCheckbox);
    await user.click(screen.getByRole("button", { name: /^done$/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());

    const putCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input) === `/api/favourites/${SHOW_ID}` &&
        (init as RequestInit).method === "PUT",
    );
    expect(putCall).toBeDefined();
    expect(JSON.parse((putCall![1] as RequestInit).body as string)).toEqual({
      listIds: [DEFAULT_LIST.id, CUSTOM_LIST.id],
    });
  });

  it("unchecking every list and pressing Done calls DELETE, never a PUT with an empty listIds", async () => {
    // The critical correctness case: PUT with listIds: [] means "save to
    // the default list" server-side, so treating an all-unchecked save
    // that way would silently re-add the show the member just removed.
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Harness listIds={[DEFAULT_LIST.id]} onChange={onChange} />);

    const defaultCheckbox = await screen.findByRole("checkbox", {
      name: /my favourites/i,
    });
    await user.click(defaultCheckbox);
    await user.click(screen.getByRole("button", { name: /^done$/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));

    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === `/api/favourites/${SHOW_ID}` &&
          (init as RequestInit).method === "PUT",
      ),
    ).toBe(false);
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === `/api/favourites/${SHOW_ID}` &&
          (init as RequestInit).method === "DELETE",
      ),
    ).toBe(true);
  });

  it("the explicit 'Remove from favourites' shortcut also calls DELETE", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Harness listIds={[DEFAULT_LIST.id]} onChange={onChange} />);
    await screen.findByRole("checkbox", { name: /my favourites/i });

    await user.click(screen.getByRole("button", { name: /remove from favourites/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === `/api/favourites/${SHOW_ID}` &&
          (init as RequestInit).method === "DELETE",
      ),
    ).toBe(true);
  });

  it("creates a new list and adds it to the pending selection without a page reload", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Harness listIds={[]} onChange={onChange} />);
    await screen.findByRole("checkbox", { name: /my favourites/i });

    await user.type(screen.getByLabelText(/new list name/i), "Jazz Digs");
    await user.click(screen.getByRole("button", { name: /create list/i }));

    const newCheckbox = await screen.findByRole("checkbox", { name: /jazz digs/i });
    expect(newCheckbox).toBeChecked();

    await user.click(screen.getByRole("button", { name: /^done$/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    const putCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        String(input) === `/api/favourites/${SHOW_ID}` &&
        (init as RequestInit).method === "PUT",
    );
    expect(JSON.parse((putCall![1] as RequestInit).body as string)).toEqual({
      listIds: ["list-new"],
    });
  });

  it("shows a visible error and leaves the sheet open when the save fails", async () => {
    vi.stubGlobal("fetch", mockFetch({ putStatus: 500 }));
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Harness listIds={[]} onChange={onChange} />);
    const customCheckbox = await screen.findByRole("checkbox", { name: /late night/i });
    await user.click(customCheckbox);
    await user.click(screen.getByRole("button", { name: /^done$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("nope");
    expect(onChange).not.toHaveBeenCalled();
  });
});
