import { Bookmark, Play } from "lucide-react";
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
          ? "h-[350px] w-[350px] shrink-0"
          : "aspect-square w-full",
      )}
      aria-label={`Open ${show.title}`}
    >
      <article className="flex h-full flex-col">
        <div className="flex h-[30px] shrink-0 items-center justify-between bg-voicesNext-cream px-2 font-outfit text-[20px] font-black uppercase leading-none tracking-[1px] text-[#443f3f]">
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
          <h3 className="absolute bottom-6 left-2 right-4 line-clamp-2 font-gabarito text-[24px] font-bold leading-[1.02] text-voicesNext-cream">
            {show.title}
          </h3>
          <div className="absolute bottom-0 left-0 flex h-[15px] w-full items-center justify-between bg-[#161616] px-2 font-asap text-[12px] uppercase leading-none text-[#cacaca]">
            <span>{formatDate(show.date)}</span>
            <span>{locationLabel}</span>
          </div>
        </div>

        <div className="grid h-[84px] shrink-0 grid-rows-[1fr_auto] border-t border-voicesNext-border bg-voicesNext-background px-3 pb-2 pt-2">
          <div className="flex flex-wrap items-start gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-voicesNext-orange bg-voicesNext-cream px-2 py-1 font-asap text-[10px] font-bold uppercase leading-none text-voicesNext-orange"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="inline-flex h-5 w-5 items-center justify-center text-voicesNext-cream">
              <Play aria-hidden="true" size={15} fill="currentColor" />
            </span>
            <span className="font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-orange">
              View details
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
