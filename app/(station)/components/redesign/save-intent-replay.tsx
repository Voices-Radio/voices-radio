"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SAVE_ARTIST_PARAM,
  SAVE_SHOW_PARAM,
} from "@/lib/voices/favourites/save-intent";
import { useFavourites } from "./favourites-context";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const CONFIRMATION_DURATION_MS = 4000;

/**
 * Replays a save that was interrupted by a join / sign-in redirect. A
 * signed-out tap on a show's bookmark (save-show-button.tsx) or an artist's
 * heart (save-artist-button.tsx) sends the visitor to
 * `/sign-in?next=<path>?save=<showId>` (or `?saveArtist=<artistId>`), from
 * where they join or sign in; once back here signed in, this reads the
 * param, saves to the caller's default list (shows) or hearts the artist,
 * and shows a brief confirmation.
 *
 * `save` is attacker-controllable — a crafted link could carry any value
 * through the sign-in flow. Three guards keep that harmless: the id is
 * validated as an ObjectId shape before it's used for anything, the replay
 * only ever writes to the default list (there is no listId in the URL to
 * honour even if one were added), and the confirmation below means the
 * action is never silent, however it was triggered. See
 * tasks/favourites-plan.md §4e/§6.
 */
export default function SaveIntentReplay() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, applyStatus, applyArtistStatus } = useFavourites();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const showId = searchParams?.get(SAVE_SHOW_PARAM);
    if (!showId || !OBJECT_ID_RE.test(showId)) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(
          `/api/favourites/${encodeURIComponent(showId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listIds: [] }),
          },
        );
        if (cancelled) return;

        if (response.ok) {
          const payload = await response.json().catch(() => null);
          applyStatus(showId, { saved: true, listIds: payload?.listIds ?? [] });
          setMessage("Saved to My Favourites");
        } else {
          setMessage("Couldn't save that show. Please try again.");
        }
      } catch {
        if (!cancelled) {
          setMessage("Couldn't save that show. Please try again.");
        }
      }
    })();

    // Strips the param immediately, before the request even resolves, so
    // a refresh or a re-render never replays the same save twice.
    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete(SAVE_SHOW_PARAM);
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : (pathname ?? "/"), {
      scroll: false,
    });

    return () => {
      cancelled = true;
    };
    // Intentionally keyed on isSignedIn/pathname only: this effect is the
    // thing that changes searchParams (via router.replace above), so
    // depending on searchParams too would re-fire on its own update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, pathname]);

  // The artist heart: same guards as above (ObjectId shape, never silent),
  // and the only write is a plain heart — there is nothing else to honour.
  useEffect(() => {
    if (!isSignedIn) return;
    const artistId = searchParams?.get(SAVE_ARTIST_PARAM);
    if (!artistId || !OBJECT_ID_RE.test(artistId)) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(
          `/api/favourites/artists/${encodeURIComponent(artistId)}`,
          { method: "PUT" },
        );
        if (cancelled) return;

        if (response.ok) {
          applyArtistStatus(artistId, { saved: true });
          setMessage("Saved to your favourite artists");
        } else {
          setMessage("Couldn't save that artist. Please try again.");
        }
      } catch {
        if (!cancelled) {
          setMessage("Couldn't save that artist. Please try again.");
        }
      }
    })();

    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete(SAVE_ARTIST_PARAM);
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : (pathname ?? "/"), {
      scroll: false,
    });

    return () => {
      cancelled = true;
    };
    // Keyed on isSignedIn/pathname only, for the same reason as above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, pathname]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), CONFIRMATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 border border-voicesNext-orange bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream shadow-lg"
    >
      {message}
    </div>
  );
}
