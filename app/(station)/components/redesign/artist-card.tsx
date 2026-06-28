import Image from "next/image";
import Link from "next/link";
import type { VoicesArtist } from "@/lib/voices/types";

export default function ArtistCard({ artist }: { artist: VoicesArtist }) {
  const locationLabel = artist.locationTags.includes("world")
    ? "World"
    : "London";
  const stationLabel =
    artist.station === "kx"
      ? "KX"
      : artist.station === "east"
      ? "EAST"
      : "RESIDENT";

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="size-full group block overflow-hidden bg-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
      aria-label={`Open ${artist.name}`}
    >
      <div className="flex h-[30px] items-center justify-between bg-voicesNext-cream px-2 font-asap text-[14px] uppercase leading-none text-voicesNext-background">
        <span>{stationLabel}</span>
        <span>{locationLabel}</span>
      </div>
      <div className="relative h-[233px]">
        <Image
          src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
          alt={artist.imageUrl ? artist.name : "Voices Radio"}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <h2 className="absolute bottom-3 left-2 right-2 line-clamp-2 font-gabarito text-[24px] font-bold leading-[1.05] text-voicesNext-cream">
          {artist.name}
        </h2>
      </div>
      <div className="grid h-[87px] grid-rows-[1fr_auto] px-2 pb-3 pt-2">
        {artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 overflow-hidden">
            {artist.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="h-[21px] rounded-full border border-voicesNext-orange px-2 py-1 font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-orange"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between font-asap text-[12px] font-bold text-voicesNext-orange">
          <span>View profile</span>
          <span aria-hidden="true">♡</span>
        </div>
      </div>
    </Link>
  );
}
