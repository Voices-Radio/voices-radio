import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { VoicesShow } from "@/lib/voices/types";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

function formatDate(date?: string) {
  if (!date) return "18.04.26";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "18.04.26";
  return dateFormatter.format(parsed).replaceAll("/", ".");
}

export default function ShowCard({
  show,
  priority = false,
  rail = false,
}: {
  show: VoicesShow;
  priority?: boolean;
  rail?: boolean;
}) {
  const genres = show.genres.length
    ? show.genres.slice(0, 3)
    : ["Hip Hop", "R&B", "House"];
  const stationLabel =
    show.station === "kx" ? "KX" : show.station === "east" ? "EAST" : "RADIO";
  const locationLabel = show.locationTags.includes("world")
    ? "World"
    : "London";

  return (
    <Link
      href={`/shows/${show.id}`}
      className={cn(
        "group block overflow-hidden border border-voicesNext-border bg-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
        rail
          ? "h-[320px] w-[320px] shrink-0 md:h-[350px] md:w-[350px]"
          : "aspect-square w-full",
      )}
      aria-label={`Open ${show.title}`}
    >
      <article className="flex h-full flex-col">
        <div className="flex h-[27px] shrink-0 items-center justify-between bg-voicesNext-cream px-2 font-outfit text-[13px] font-black uppercase leading-none text-voicesNext-background">
          <span>{stationLabel}</span>
          <span>{locationLabel}</span>
        </div>

        <div className="relative min-h-0 flex-1">
          <Image
            src={show.artwork.src}
            alt={show.artwork.alt}
            fill
            sizes="(min-width: 768px) 350px, 88vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="from-black/85 via-black/15 absolute inset-0 bg-gradient-to-t to-transparent" />
          <h3 className="absolute bottom-5 left-3 right-4 line-clamp-2 font-gabarito text-[24px] font-bold leading-[1.02] text-voicesNext-cream">
            {show.title}
          </h3>
        </div>

        <div className="grid h-[86px] shrink-0 grid-rows-[1fr_auto] border-t border-voicesNext-border bg-voicesNext-background px-3 pb-3 pt-3">
          <div className="flex flex-wrap items-start gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-voicesNext-cream/60 px-2 py-1 font-asap text-[10px] font-bold uppercase leading-none text-voicesNext-cream"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-orange">
              Tracklist
            </span>
            <span className="ml-auto font-asap text-[10px] font-bold uppercase leading-none text-voicesNext-secondary">
              {formatDate(show.date)}
            </span>
            <span className="font-asap text-[10px] font-bold uppercase leading-none text-voicesNext-secondary">
              {locationLabel}
            </span>
            <Bookmark
              aria-hidden="true"
              className="mb-[-2px] h-5 w-5 text-voicesNext-secondary"
              strokeWidth={1.8}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
