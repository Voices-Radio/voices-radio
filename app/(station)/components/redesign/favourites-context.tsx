"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { FavouriteListApi } from "@/lib/voices/favourites/schemas";
import { useSessionUser } from "./use-session-user";

export type SaveStatus = { saved: boolean; listIds: string[] };

const UNSAVED: SaveStatus = { saved: false, listIds: [] };

type FavouritesContextValue = {
  isSignedIn: boolean;
  getStatus: (showId: string) => SaveStatus;
  registerShowIds: (showIds: string[]) => void;
  applyStatus: (showId: string, status: SaveStatus) => void;
  lists: FavouriteListApi[] | null;
  listsLoading: boolean;
  ensureListsLoaded: () => void;
  addListToCache: (list: FavouriteListApi) => void;
  renameListInCache: (listId: string, name: string) => void;
  removeListFromCache: (listId: string) => void;
};

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

/**
 * Shared saved-state for every ShowCard on the page, and the redirect
 * decision for the save button.
 *
 * Registering a show id queues it into one batched
 * `GET /api/favourites/status` call rather than one request per card — a
 * grid of 30 cards mounting together produces a single request. See
 * tasks/favourites-plan.md §4d.
 *
 * A signed-out visitor never registers at all: every card renders unsaved
 * and save-show-button.tsx routes the click to /sign-in instead of
 * touching this context, so there is nothing to batch or fetch for them.
 */
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { user, status } = useSessionUser();
  const isSignedIn = status === "ready" && Boolean(user);

  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});
  const knownIds = useRef<Set<string>>(new Set());
  const pendingIds = useRef<Set<string>>(new Set());
  const flushScheduled = useRef(false);

  const flush = useCallback(() => {
    flushScheduled.current = false;
    const ids = Array.from(pendingIds.current);
    pendingIds.current.clear();
    if (ids.length === 0) return;

    const query = ids.map(encodeURIComponent).join(",");
    fetch(`/api/favourites/status?showIds=${query}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { statuses?: Record<string, SaveStatus> } | null) => {
        const fetched = payload?.statuses ?? {};
        setStatuses((prev) => {
          const next = { ...prev };
          for (const id of ids) next[id] = fetched[id] ?? UNSAVED;
          return next;
        });
      })
      .catch(() => {
        // A failed lookup degrades the pending cards to "unsaved" rather
        // than leaving their button stuck in a loading state forever — a
        // false negative here is far cheaper than a permanently
        // unclickable card.
        setStatuses((prev) => {
          const next = { ...prev };
          for (const id of ids) if (!(id in next)) next[id] = UNSAVED;
          return next;
        });
      });
  }, []);

  const registerShowIds = useCallback(
    (showIds: string[]) => {
      if (!isSignedIn || showIds.length === 0) return;
      let hasNew = false;
      for (const id of showIds) {
        if (!knownIds.current.has(id)) {
          knownIds.current.add(id);
          pendingIds.current.add(id);
          hasNew = true;
        }
      }
      if (hasNew && !flushScheduled.current) {
        flushScheduled.current = true;
        // Deferred a tick so every card mounting in the same pass has
        // registered before the batched request fires.
        queueMicrotask(flush);
      }
    },
    [flush, isSignedIn],
  );

  const getStatus = useCallback(
    (showId: string): SaveStatus => statuses[showId] ?? UNSAVED,
    [statuses],
  );

  /** Applies a save/unsave result immediately — the optimistic update. */
  const applyStatus = useCallback((showId: string, nextStatus: SaveStatus) => {
    knownIds.current.add(showId);
    setStatuses((prev) => ({ ...prev, [showId]: nextStatus }));
  }, []);

  // The caller's lists (My Favourites + custom lists), shared across every
  // save-to-list-sheet on the page so opening the sheet on a second card
  // doesn't re-fetch — only the first open per page view does.
  const [lists, setLists] = useState<FavouriteListApi[] | null>(null);
  const [listsLoading, setListsLoading] = useState(false);
  const listsRequested = useRef(false);

  const ensureListsLoaded = useCallback(() => {
    if (listsRequested.current) return;
    listsRequested.current = true;
    setListsLoading(true);

    fetch("/api/favourites/lists", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { lists?: FavouriteListApi[] } | null) => {
        setLists(payload?.lists ?? []);
      })
      .catch(() => {
        // Lets the sheet retry on next open rather than getting stuck
        // believing lists were fetched when the request actually failed.
        listsRequested.current = false;
        setLists(null);
      })
      .finally(() => setListsLoading(false));
  }, []);

  const addListToCache = useCallback((list: FavouriteListApi) => {
    setLists((prev) => (prev ? [...prev, list] : [list]));
  }, []);

  const renameListInCache = useCallback((listId: string, name: string) => {
    setLists((prev) =>
      prev
        ? prev.map((list) => (list.id === listId ? { ...list, name } : list))
        : prev,
    );
  }, []);

  const removeListFromCache = useCallback((listId: string) => {
    setLists((prev) =>
      prev ? prev.filter((list) => list.id !== listId) : prev,
    );
  }, []);

  const value = useMemo<FavouritesContextValue>(
    () => ({
      isSignedIn,
      getStatus,
      registerShowIds,
      applyStatus,
      lists,
      listsLoading,
      ensureListsLoaded,
      addListToCache,
      renameListInCache,
      removeListFromCache,
    }),
    [
      isSignedIn,
      getStatus,
      registerShowIds,
      applyStatus,
      lists,
      listsLoading,
      ensureListsLoaded,
      addListToCache,
      renameListInCache,
      removeListFromCache,
    ],
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) {
    throw new Error("useFavourites must be used within a FavouritesProvider");
  }
  return ctx;
}
