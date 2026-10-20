"use client";

import { useState } from "react";
import ArtistCard, { type ArtistCardArtist } from "./artist-card";

export type ArtistCardData = ArtistCardArtist;

/** Drives both the wrapper height and its off-screen placeholder size. */
const CARD_HEIGHT_PX = 350;
const PRIORITY_IMAGE_COUNT = 3;

/**
 * Client-side "load more" for /artists. The server already holds the whole
 * list, so revealing more is a state change: no navigation, no scroll jump,
 * and the cards already on screen keep their keys and never remount.
 * `content-visibility: auto` lets the browser skip layout and paint for
 * off-screen cards, so render cost stays flat as the list grows.
 */
export default function ArtistGrid({
  artists,
  initialVisible,
  batchSize,
  expandHref,
}: {
  artists: ArtistCardData[];
  initialVisible: number;
  batchSize: number;
  expandHref: string;
}) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const shown = Math.min(visibleCount, artists.length);
  const remaining = artists.length - shown;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {artists.slice(0, shown).map((artist, index) => (
          <div
            key={artist.id}
            className="w-full max-w-[350px] [content-visibility:auto]"
            style={{
              height: CARD_HEIGHT_PX,
              containIntrinsicSize: `auto ${CARD_HEIGHT_PX}px`,
            }}
          >
            <ArtistCard artist={artist} priority={index < PRIORITY_IMAGE_COUNT} />
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown} of {artists.length} artists
      </p>
      {remaining > 0 && (
        <div className="mt-10 min-h-[36px] text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(shown + batchSize)}
            className="inline-flex rounded-full border border-voicesNext-cream px-[17px] py-1 font-asap text-[16px] font-bold uppercase text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            Load More ({remaining} left)
          </button>
          <noscript>
            <a href={expandHref} className="font-asap text-voicesNext-cream underline">
              Show all artists
            </a>
          </noscript>
        </div>
      )}
    </>
  );
}
