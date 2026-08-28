"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavourites } from "./favourites-context";

const SAVE_INTENT_PARAM = "save";
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const CONFIRMATION_DURATION_MS = 4000;

/**
 * Replays a save that was interrupted by a sign-in redirect. A signed-out
 * tap on the bookmark (save-show-button.tsx) sends the visitor to
 * `/sign-in?next=<path>?save=<showId>`; once signed in and redirected back
 * here, this reads `?save=`, saves the show to the caller's default list,
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
  const { isSignedIn, applyStatus } = useFavourites();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const showId = searchParams?.get(SAVE_INTENT_PARAM);
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
    nextParams.delete(SAVE_INTENT_PARAM);
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
