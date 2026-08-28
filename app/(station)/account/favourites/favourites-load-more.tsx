"use client";

import { useState } from "react";
import type { VoicesShow } from "@/lib/voices/types";
import ShowGrid from "../../components/redesign/show-grid";

/**
 * Client-side "load more" for /account/favourites. The page's own initial
 * render already has the first page from getFavourites(); this only
 * exists for the follow-up pages a Server Component can't fetch on its
 * own — see lib/voices/favourites/client.ts's fetchFavourites doc comment.
 */
export default function FavouritesLoadMore({
  initialShows,
  initialCursor,
  listId,
}: {
  initialShows: VoicesShow[];
  initialCursor: string | null;
  listId?: string;
}) {
  const [shows, setShows] = useState(initialShows);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ cursor });
      if (listId) params.set("listId", listId);
      const response = await fetch(`/api/favourites?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.message || "Couldn't load more favourites.");
        return;
      }
      const newShows = ((payload?.favourites ?? []) as Array<{ show: VoicesShow | null }>)
        .map((row) => row.show)
        .filter((show): show is VoicesShow => Boolean(show));
      setShows((prev) => [...prev, ...newShows]);
      setCursor(payload?.nextCursor ?? null);
    } catch {
      setError("Couldn't load more favourites.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ShowGrid shows={shows} />

      {error && (
        <p role="alert" className="mt-4 font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}

      {cursor && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-voicesNext-border px-6 py-3 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
