import Image from "next/image";
import Link from "next/link";
import type { VoicesArtist } from "@/lib/voices/types";
import SaveArtistButton from "./save-artist-button";

export default function ArtistCard({ artist }: { artist: VoicesArtist }) {
  return (
    <article className="group relative h-full w-full overflow-hidden bg-voicesNext-background">
      {/*
        Stretched-link, as in ShowCard: the whole card stays clickable while
        the heart below is a sibling <button>, not a descendant, so there's
        no interactive element nested inside another.
      */}
      <Link
        href={`/artists/${artist.id}`}
        aria-label={`Open ${artist.name}`}
        className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      />

      <div className="pointer-events-none flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          <Image
            src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artist.imageUrl ? artist.name : "Voices Radio"}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <h2 className="absolute bottom-3 left-3 right-3 line-clamp-2 font-gabarito text-[24px] font-bold leading-[1.05] text-voicesNext-cream">
            {artist.name}
          </h2>
        </div>

        {/*
          One shared bottom line: genres on the left, heart on the right.
          The heart is bottom-aligned with the last genre row (its negative
          margins pull the 44px tap target in line with the 21px pills and
          the card's 12px gutter), so both sit on the same horizontal line.
        */}
        <div className="flex h-[72px] shrink-0 items-end justify-between gap-3 px-3 pb-3">
          <div className="flex max-h-[50px] min-w-0 flex-wrap gap-2 overflow-hidden">
            {artist.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="h-[21px] rounded-full border border-voicesNext-orange px-2 py-1 font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-orangeText"
              >
                {genre}
              </span>
            ))}
          </div>
          <SaveArtistButton
            artistId={artist.id}
            name={artist.name}
            className="pointer-events-auto relative z-10 -mb-[11px] -mr-2 ml-auto shrink-0"
          />
        </div>
      </div>
    </article>
  );
}
