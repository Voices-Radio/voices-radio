import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/membership/session", () => ({
  getAccessToken: vi.fn(),
  authedFetch: vi.fn(),
}));

const { getAccessToken, authedFetch } =
  await import("@/lib/voices/membership/session");
const {
  getFavouriteLists,
  getFavourites,
  fetchFavouriteLists,
  fetchFavourites,
  createFavouriteList,
  renameFavouriteList,
  deleteFavouriteList,
  getFavouritesStatus,
  saveShowToLists,
  unsaveShow,
  statusForFavouritesError,
} = await import("./client");

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function mockFetchOnce(res: Response) {
  const fn = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) => res,
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

const rawShow = {
  _id: "507f1f77bcf86cd799439021",
  title: "Late Night Sessions",
  description: "",
  imageUrl: "https://example.com/art.jpg",
  station: "kx",
  locationTags: ["london"],
  matching_status: "matched",
};

const validList = {
  id: "507f1f77bcf86cd799439031",
  name: "My Favourites",
  isDefault: true,
  showCount: 2,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("statusForFavouritesError", () => {
  it("maps NO_SESSION to 401", () => {
    expect(statusForFavouritesError("NO_SESSION")).toBe(401);
  });

  it("passes a backend status code straight through", () => {
    expect(statusForFavouritesError("404")).toBe(404);
    expect(statusForFavouritesError("400")).toBe(400);
    expect(statusForFavouritesError("409")).toBe(409);
  });

  it("falls back to 502 for a non-numeric or out-of-range code", () => {
    expect(statusForFavouritesError("NETWORK_ERROR")).toBe(502);
    expect(statusForFavouritesError("INVALID_RESPONSE")).toBe(502);
    expect(statusForFavouritesError("200")).toBe(502);
  });
});

describe("Server Component reads (non-refreshing)", () => {
  it("getFavouriteLists returns NO_SESSION without calling fetch when there's no token", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await getFavouriteLists();

    expect(result).toMatchObject({ ok: false, code: "NO_SESSION" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getFavouriteLists attaches the bearer token and unwraps the lists array", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const fetchMock = mockFetchOnce(response({ lists: [validList] }));

    const result = await getFavouriteLists();

    expect(result).toEqual({ ok: true, data: [validList] });
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).headers).toEqual({
      Authorization: "Bearer token-123",
    });
  });

  it("getFavourites normalizes the embedded raw show into a VoicesShow", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    mockFetchOnce(
      response({
        favourites: [
          {
            showId: rawShow._id,
            show: rawShow,
            listIds: [validList.id],
            createdAt: "2026-01-02T00:00:00Z",
          },
        ],
        nextCursor: null,
      }),
    );

    const result = await getFavourites();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.favourites).toHaveLength(1);
    expect(result.data.favourites[0].show?.id).toBe(rawShow._id);
    expect(result.data.favourites[0].show?.title).toBe("Late Night Sessions");
    expect(result.data.favourites[0].listIds).toEqual([validList.id]);
  });

  it("getFavourites carries a null show through for a deleted show", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    mockFetchOnce(
      response({
        favourites: [
          {
            showId: rawShow._id,
            show: null,
            listIds: [],
            createdAt: "2026-01-02T00:00:00Z",
          },
        ],
        nextCursor: null,
      }),
    );

    const result = await getFavourites();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.favourites[0].show).toBeNull();
  });

  it("returns INVALID_RESPONSE rather than throwing on a malformed payload", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    mockFetchOnce(response({ lists: [{ id: "only-an-id" }] }));

    const result = await getFavouriteLists();

    expect(result).toMatchObject({ ok: false, code: "INVALID_RESPONSE" });
  });

  it("returns NETWORK_ERROR rather than throwing when fetch rejects", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("down");
      }),
    );

    const result = await getFavouriteLists();

    expect(result).toMatchObject({ ok: false, code: "NETWORK_ERROR" });
  });

  it("rethrows a Next.js control-flow error instead of swallowing it", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const controlFlowError = Object.assign(new Error("DYNAMIC_SERVER_USAGE"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw controlFlowError;
      }),
    );

    await expect(getFavouriteLists()).rejects.toBe(controlFlowError);
  });

  it("maps the plain { message } error envelope to a readable message, not a raw code", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    mockFetchOnce(response({ message: "List not found" }, 404));

    const result = await getFavouriteLists();

    expect(result).toEqual({
      ok: false,
      code: "404",
      message: "List not found",
    });
  });
});

describe("Route Handler reads + writes (refreshing)", () => {
  it("fetchFavouriteLists calls authedFetch, not the plain global fetch", async () => {
    vi.mocked(authedFetch).mockResolvedValue(response({ lists: [validList] }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchFavouriteLists();

    expect(result).toEqual({ ok: true, data: [validList] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authedFetch).toHaveBeenCalledWith("/api/favourites/lists", {});
  });

  it("fetchFavourites builds the listId/cursor query string", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ favourites: [], nextCursor: null }),
    );

    await fetchFavourites({ listId: validList.id, cursor: "abc" });

    expect(authedFetch).toHaveBeenCalledWith(
      `/api/favourites?listId=${validList.id}&cursor=abc`,
      {},
    );
  });

  it("createFavouriteList POSTs the trimmed name and unwraps the created list", async () => {
    vi.mocked(authedFetch).mockResolvedValue(response({ list: validList }));

    const result = await createFavouriteList("My Favourites");

    expect(result).toEqual({ ok: true, data: validList });
    const [path, init] = vi.mocked(authedFetch).mock.calls[0];
    expect(path).toBe("/api/favourites/lists");
    expect((init as RequestInit).method).toBe("POST");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      name: "My Favourites",
    });
  });

  it("renameFavouriteList PATCHes the encoded list id", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ list: { ...validList, name: "Renamed" } }),
    );

    const result = await renameFavouriteList("list/with slash", "Renamed");

    expect(result).toMatchObject({ ok: true, data: { name: "Renamed" } });
    const [path, init] = vi.mocked(authedFetch).mock.calls[0];
    expect(path).toBe("/api/favourites/lists/list%2Fwith%20slash");
    expect((init as RequestInit).method).toBe("PATCH");
  });

  it("deleteFavouriteList DELETEs with no body", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ message: "List deleted" }),
    );

    const result = await deleteFavouriteList(validList.id);

    expect(result).toEqual({ ok: true, data: { message: "List deleted" } });
    const [, init] = vi.mocked(authedFetch).mock.calls[0];
    expect((init as RequestInit).method).toBe("DELETE");
    expect((init as RequestInit).body).toBeUndefined();
  });

  it("getFavouritesStatus short-circuits to an empty map without calling authedFetch", async () => {
    const result = await getFavouritesStatus([]);

    expect(result).toEqual({ ok: true, data: {} });
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("getFavouritesStatus joins ids into a comma-separated query param", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({
        statuses: { [rawShow._id]: { saved: true, listIds: [validList.id] } },
      }),
    );

    const result = await getFavouritesStatus([
      rawShow._id,
      "507f1f77bcf86cd799439022",
    ]);

    expect(result).toEqual({
      ok: true,
      data: { [rawShow._id]: { saved: true, listIds: [validList.id] } },
    });
    const [path] = vi.mocked(authedFetch).mock.calls[0];
    expect(path).toBe(
      `/api/favourites/status?showIds=${rawShow._id}%2C507f1f77bcf86cd799439022`,
    );
  });

  it("saveShowToLists PUTs listIds and defaults to an empty array", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ showId: rawShow._id, listIds: [validList.id] }),
    );

    await saveShowToLists(rawShow._id);

    const [path, init] = vi.mocked(authedFetch).mock.calls[0];
    expect(path).toBe(`/api/favourites/${rawShow._id}`);
    expect((init as RequestInit).method).toBe("PUT");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      listIds: [],
    });
  });

  it("unsaveShow DELETEs the encoded showId", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ message: "Show removed from favourites" }),
    );

    const result = await unsaveShow(rawShow._id);

    expect(result).toEqual({
      ok: true,
      data: { message: "Show removed from favourites" },
    });
  });

  it("maps a non-ok authedFetch response to the { message } envelope, not a thrown error", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ message: "One or more lists were not found" }, 400),
    );

    const result = await saveShowToLists(rawShow._id, ["someone-elses-list"]);

    expect(result).toEqual({
      ok: false,
      code: "400",
      message: "One or more lists were not found",
    });
  });
});
