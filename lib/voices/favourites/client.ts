import "server-only";
import type { z } from "zod";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";
import { getAccessToken, authedFetch } from "@/lib/voices/membership/session";
import { normalizeShow } from "@/lib/voices/normalizers";
import type { VoicesShow, VoicesShowRaw } from "@/lib/voices/types";
import {
  listsResponseSchema,
  listResponseSchema,
  statusResponseSchema,
  saveResponseSchema,
  favouritesResponseSchema,
  messageResponseSchema,
  type FavouriteListApi,
  type FavouriteStatusMap,
} from "./schemas";

export type FavouritesResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "We couldn't reach Voices. Please try again shortly.";

/**
 * Every /api/favourites/* error response is the plain `{ message }`
 * envelope routes/favourites.js uses throughout (not the membership
 * subsystem's `{ error: { code, message } }` contract) — there is no
 * documented code enum to switch on here, only a message safe to show.
 */
async function describeError(
  response: Response,
): Promise<{ code: string; message: string }> {
  const payload: unknown = await response.json().catch(() => null);
  const message =
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
      ? (payload as { message: string }).message
      : DEFAULT_ERROR_MESSAGE;
  return { code: String(response.status), message };
}

/**
 * Non-refreshing authenticated GET, for direct use from Server Component
 * render (the /account/favourites pages). Mirrors
 * lib/voices/membership/membership-client.ts's authedGet exactly, and for
 * the same reason: refreshing mutates cookies, which Next.js only allows
 * from a Route Handler or Server Action, never from render. Every
 * /account page already sits behind requireSession(), which has
 * guaranteed a fresh access token before this runs.
 */
async function authedGet<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<FavouritesResult<T>> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, code: "NO_SESSION", message: "Please sign in again." };
  }

  try {
    const response = await fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const { code, message } = await describeError(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        `Voices ${path} response failed validation:`,
        parsed.error.flatten(),
      );
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: DEFAULT_ERROR_MESSAGE,
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error(`Voices ${path} failed:`, error);
    return { ok: false, code: "NETWORK_ERROR", message: NETWORK_ERROR_MESSAGE };
  }
}

/**
 * Refreshing authenticated call — reads AND writes — for use inside Route
 * Handlers (app/api/favourites/**), which unlike Server Component render
 * are allowed to mutate cookies. This is what every browser-facing save,
 * unsave, and list edit goes through, so an action taken deep into a long
 * browsing session transparently refreshes the token instead of 401ing.
 */
async function authedCall<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  init: RequestInit = {},
): Promise<FavouritesResult<T>> {
  try {
    const response = await authedFetch(path, init);

    if (!response.ok) {
      const { code, message } = await describeError(response);
      return { ok: false, code, message };
    }

    const payload = await response.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        `Voices ${path} response failed validation:`,
        parsed.error.flatten(),
      );
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: DEFAULT_ERROR_MESSAGE,
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error(`Voices ${path} failed:`, error);
    return { ok: false, code: "NETWORK_ERROR", message: NETWORK_ERROR_MESSAGE };
  }
}

/**
 * Maps a FavouritesResult's `code` to an HTTP status for a BFF route to
 * return. `describeError` above sets `code` to the backend's own status
 * string for anything it responded to (so a 400/404/409 from
 * routes/favourites.js passes straight through), "NO_SESSION" to 401, and
 * anything else (a network failure, a validation failure of our own) to
 * 502 — the browser did nothing wrong, our proxy did.
 */
export function statusForFavouritesError(code: string): number {
  if (code === "NO_SESSION") return 401;
  const numeric = Number(code);
  if (Number.isInteger(numeric) && numeric >= 400 && numeric < 600)
    return numeric;
  return 502;
}

function jsonInit(method: string, body?: unknown): RequestInit {
  if (body === undefined) return { method };
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export type FavouriteRow = {
  showId: string;
  show: VoicesShow | null;
  listIds: string[];
  createdAt: string;
};

function toFavouriteRow(
  row: z.infer<typeof favouritesResponseSchema>["favourites"][number],
): FavouriteRow {
  return {
    showId: row.showId,
    listIds: row.listIds,
    createdAt: row.createdAt,
    show: row.show ? normalizeShow(row.show as unknown as VoicesShowRaw) : null,
  };
}

// --- Server Component reads (non-refreshing) --------------------------

/** Direct backend read for /account/favourites Server Components. */
export async function getFavouriteLists(): Promise<
  FavouritesResult<FavouriteListApi[]>
> {
  const result = await authedGet("/api/favourites/lists", listsResponseSchema);
  return result.ok ? { ok: true, data: result.data.lists } : result;
}

/** Direct backend read for /account/favourites Server Components. */
export async function getFavourites(
  params: { listId?: string; cursor?: string } = {},
): Promise<
  FavouritesResult<{ favourites: FavouriteRow[]; nextCursor: string | null }>
> {
  const search = new URLSearchParams();
  if (params.listId) search.set("listId", params.listId);
  if (params.cursor) search.set("cursor", params.cursor);
  const query = search.toString();

  const result = await authedGet(
    `/api/favourites${query ? `?${query}` : ""}`,
    favouritesResponseSchema,
  );
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      nextCursor: result.data.nextCursor,
      favourites: result.data.favourites.map(toFavouriteRow),
    },
  };
}

// --- Route Handler reads + writes (refreshing) --------------------------

/** BFF-facing read, for app/api/favourites/lists/route.ts. */
export async function fetchFavouriteLists(): Promise<
  FavouritesResult<FavouriteListApi[]>
> {
  const result = await authedCall("/api/favourites/lists", listsResponseSchema);
  return result.ok ? { ok: true, data: result.data.lists } : result;
}

/**
 * BFF-facing read, for app/api/favourites/route.ts — backs a client-side
 * "load more" on /account/favourites. The page's initial render still
 * comes from getFavourites() above; this exists only for the paginated
 * follow-up requests a Server Component can't make on its own.
 */
export async function fetchFavourites(
  params: { listId?: string; cursor?: string } = {},
): Promise<
  FavouritesResult<{ favourites: FavouriteRow[]; nextCursor: string | null }>
> {
  const search = new URLSearchParams();
  if (params.listId) search.set("listId", params.listId);
  if (params.cursor) search.set("cursor", params.cursor);
  const query = search.toString();

  const result = await authedCall(
    `/api/favourites${query ? `?${query}` : ""}`,
    favouritesResponseSchema,
  );
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      nextCursor: result.data.nextCursor,
      favourites: result.data.favourites.map(toFavouriteRow),
    },
  };
}

export async function createFavouriteList(
  name: string,
): Promise<FavouritesResult<FavouriteListApi>> {
  const result = await authedCall(
    "/api/favourites/lists",
    listResponseSchema,
    jsonInit("POST", { name }),
  );
  return result.ok ? { ok: true, data: result.data.list } : result;
}

export async function renameFavouriteList(
  listId: string,
  name: string,
): Promise<FavouritesResult<FavouriteListApi>> {
  const result = await authedCall(
    `/api/favourites/lists/${encodeURIComponent(listId)}`,
    listResponseSchema,
    jsonInit("PATCH", { name }),
  );
  return result.ok ? { ok: true, data: result.data.list } : result;
}

export function deleteFavouriteList(
  listId: string,
): Promise<FavouritesResult<{ message: string }>> {
  return authedCall(
    `/api/favourites/lists/${encodeURIComponent(listId)}`,
    messageResponseSchema,
    jsonInit("DELETE"),
  );
}

/** Bulk saved-state lookup for a page of show cards — one call, not N. */
export async function getFavouritesStatus(
  showIds: string[],
): Promise<FavouritesResult<FavouriteStatusMap>> {
  if (showIds.length === 0) return { ok: true, data: {} };

  const query = new URLSearchParams({ showIds: showIds.join(",") }).toString();
  const result = await authedCall(
    `/api/favourites/status?${query}`,
    statusResponseSchema,
  );
  return result.ok ? { ok: true, data: result.data.statuses } : result;
}

/** Empty/omitted listIds saves to the caller's default "My Favourites" list. */
export function saveShowToLists(
  showId: string,
  listIds: string[] = [],
): Promise<FavouritesResult<{ showId: string; listIds: string[] }>> {
  return authedCall(
    `/api/favourites/${encodeURIComponent(showId)}`,
    saveResponseSchema,
    jsonInit("PUT", { listIds }),
  );
}

export function unsaveShow(
  showId: string,
): Promise<FavouritesResult<{ message: string }>> {
  return authedCall(
    `/api/favourites/${encodeURIComponent(showId)}`,
    messageResponseSchema,
    jsonInit("DELETE"),
  );
}
