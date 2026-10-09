"use client";

import { Bookmark } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  SAVE_SHOW_PARAM,
  joinHrefForSaveIntent,
} from "@/lib/voices/favourites/save-intent";
import { useFavourites } from "./favourites-context";
import dynamic from "next/dynamic";

// The sheet (framer-motion, list management) only matters once someone opens
// it, but every ShowCard on a page mounts a SaveShowButton — so it was being
// shipped to, and evaluated for, every visitor. Load it on first open.
const SaveToListSheet = dynamic(() => import("./save-to-list-sheet"), {
  ssr: false,
});

/**
 * The bottom-right bookmark on ShowCard (Figma node 1159-15832), now wired
 * up. Sits as a sibling of the card's stretched `<Link>`, never nested
 * inside it — a `<button>` inside an `<a>` is invalid HTML and would fire
 * both the save and the navigation on one tap.
 *
 * Interaction: a tap when unsaved saves straight to "My Favourites" (the
 * common case, one tap); a tap when already saved opens the list picker to
 * manage which lists it's in or remove it. Signed-out visitors are routed
 * to /join?next=… (which offers "Already have an account? Sign in") with
 * the intended save encoded in `next`; see save-intent-replay.tsx for how
 * it's replayed afterwards.
 */
export default function SaveShowButton({
  showId,
  title,
  className,
}: {
  showId: string;
  title: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, getStatus, registerShowIds, applyStatus } =
    useFavourites();
  const [pending, setPending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Stays true after the first open so the sheet keeps its exit animation.
  const [sheetRequested, setSheetRequested] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerShowIds([showId]);
  }, [showId, registerShowIds]);

  const status = getStatus(showId);

  async function saveToDefault() {
    setPending(true);
    const previous = status;
    applyStatus(showId, { saved: true, listIds: previous.listIds });
    try {
      const response = await fetch(
        `/api/favourites/${encodeURIComponent(showId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listIds: [] }),
        },
      );
      if (!response.ok) throw new Error("save failed");
      const payload = await response.json();
      applyStatus(showId, { saved: true, listIds: payload.listIds ?? [] });
    } catch {
      applyStatus(showId, previous);
    } finally {
      setPending(false);
    }
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Belt and braces: the button is a positioned sibling of the card's
    // stretched Link, not a descendant, so this click never bubbles into
    // it — but stopping it here costs nothing and survives future markup
    // changes that might nest them again.
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      router.push(
        joinHrefForSaveIntent(pathname, search, SAVE_SHOW_PARAM, showId),
      );
      return;
    }

    if (pending) return;

    if (status.saved) {
      setSheetRequested(true);
      setSheetOpen(true);
    } else {
      void saveToDefault();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={status.saved}
        aria-label={
          status.saved ? `Manage lists for ${title}` : `Save ${title}`
        }
        className={cn(
          // p-3/-m-3 grows the tap target to 44px (WCAG 2.5.5) without
          // shifting the visible 20px icon or the row's own layout — the
          // padding claims the extra space, the equal negative margin
          // gives it straight back.
          // Named group (not the bare `group` ShowCard's outer <article>
          // already claims for its artwork-scale hover) so this button's
          // own hover/focus can drive the icon below without also lighting
          // up — or being lit up by — the card's unrelated group-hover.
          "group/save -m-3 flex h-11 w-11 items-center justify-center p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange disabled:cursor-wait",
          className,
        )}
      >
        <Bookmark
          aria-hidden="true"
          className={cn(
            // Same light-up idiom as the Home feature CTAs (Read/Listen):
            // a colour shift plus a soft glow on hover/focus, no transform.
            "mb-[-2px] h-5 w-5 transition-[color,filter] duration-300 group-hover/save:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)] group-focus-visible/save:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)]",
            status.saved
              ? "fill-voicesNext-orange text-voicesNext-orange"
              : "text-voicesNext-secondary group-hover/save:text-voicesNext-orange group-focus-visible/save:text-voicesNext-orange",
          )}
          strokeWidth={1.8}
        />
      </button>

      {isSignedIn && sheetRequested && (
        <SaveToListSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          showId={showId}
          title={title}
          listIds={status.listIds}
          onListIdsChange={(listIds) =>
            applyStatus(showId, { saved: listIds.length > 0, listIds })
          }
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
