"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  SAVE_ARTIST_PARAM,
  signInHrefForSaveIntent,
} from "@/lib/voices/favourites/save-intent";
import { useFavourites } from "./favourites-context";

/**
 * The heart on an ArtistCard: a plain on/off follow. Sits as a sibling of
 * the card's stretched `<Link>`, never inside it — a `<button>` in an `<a>`
 * is invalid HTML and would fire both the toggle and the navigation.
 *
 * Signed-out visitors are sent to /sign-in?next=…, with the intended heart
 * encoded in `next`; save-intent-replay.tsx completes it after they join or
 * sign in. See save-show-button.tsx for the show equivalent.
 */
export default function SaveArtistButton({
  artistId,
  name,
  className,
}: {
  artistId: string;
  name: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, getArtistStatus, registerArtistIds, applyArtistStatus } =
    useFavourites();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    registerArtistIds([artistId]);
  }, [artistId, registerArtistIds]);

  const { saved } = getArtistStatus(artistId);

  async function toggle() {
    setPending(true);
    applyArtistStatus(artistId, { saved: !saved });
    try {
      const response = await fetch(
        `/api/favourites/artists/${encodeURIComponent(artistId)}`,
        { method: saved ? "DELETE" : "PUT" },
      );
      if (!response.ok) throw new Error("toggle failed");
    } catch {
      applyArtistStatus(artistId, { saved });
    } finally {
      setPending(false);
    }
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      router.push(
        signInHrefForSaveIntent(
          pathname ?? "/artists",
          search,
          SAVE_ARTIST_PARAM,
          artistId,
        ),
      );
      return;
    }

    if (pending) return;
    void toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from favourites` : `Save ${name}`}
      className={cn(
        // 44px tap target (WCAG 2.5.5) around a 28px icon.
        "group/heart flex h-11 w-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange disabled:cursor-wait",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "h-7 w-7 transition-[color,filter] duration-300 group-hover/heart:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)] group-focus-visible/heart:drop-shadow-[0_0_8px_rgba(211,78,36,0.65)]",
          saved
            ? "fill-voicesNext-orange text-voicesNext-orange"
            : "text-voicesNext-orangeText group-hover/heart:text-voicesNext-orange group-focus-visible/heart:text-voicesNext-orange",
        )}
        strokeWidth={1.8}
      />
    </button>
  );
}
