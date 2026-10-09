"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasSearchResults,
  type SearchCategories,
  type SearchResponse,
} from "./search-model";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

/**
 * State and debounced fetch behind the header search, shared by the desktop
 * dropdown and the mobile menu (they show the same results for the same query).
 *
 * `active` is "a search surface is open" — the fetch only runs while one is, so
 * a closed header never hits /api/search.
 */
export function useSiteSearch(active: boolean) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCategories | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const ready = trimmedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!active || !ready) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ q: trimmedQuery, limit: "5" });
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response
          .json()
          .catch(() => null)) as SearchResponse | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Search failed.");
        }

        setResults({
          shows: payload?.categories?.shows ?? [],
          artists: payload?.categories?.artists ?? [],
          mainBlog: payload?.categories?.mainBlog ?? [],
          podcastBlog: payload?.categories?.podcastBlog ?? [],
        });
      } catch (caught) {
        if ((caught as Error).name === "AbortError") return;

        setResults(null);
        setError(caught instanceof Error ? caught.message : "Search failed.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [active, ready, trimmedQuery]);

  /** Drops results and errors (e.g. on navigation) without touching the query. */
  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    trimmedQuery,
    ready,
    results,
    loading,
    error,
    hasResults: hasSearchResults(results),
    reset,
  };
}

export type SiteSearch = ReturnType<typeof useSiteSearch>;
