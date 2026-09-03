import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../components/redesign/page-hero";
import ArchivePlayPanel from "../../components/redesign/archive-play-panel";
import ShowRail from "../../components/redesign/show-rail";
import SupporterBlock from "../../components/redesign/supporter-block";
import { getShow, getShowsForArtist } from "@/lib/voices/api";
import { formatShowDisplayTitle } from "@/lib/voices/show-title";

type ShowPageProps = {
  params: Promise<{ id: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(date?: string) {
  if (!date) return "Archive date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Archive date unavailable";
  return dateFormatter.format(parsed);
}

function formatDuration(duration?: number) {
  if (!duration) return null;
  const minutes = Math.round(duration / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

export async function generateMetadata({
  params,
}: ShowPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getShow(id).catch(() => null);

  if (!show) {
    return { title: "Show not found" };
  }

  const title = formatShowDisplayTitle(show.title);

  return {
    title: `${title} | Voices Radio`,
    description: show.description || `Listen back to ${title} on Voices Radio.`,
    alternates: { canonical: `/shows/${id}` },
    openGraph: {
      title,
      description:
        show.description || `Listen back to ${title} on Voices Radio.`,
      images: [{ url: show.artwork.src }],
    },
  };
}

export default async function ShowDetailPage({ params }: ShowPageProps) {
  const { id } = await params;
  const show = await getShow(id);

  if (!show) {
    notFound();
  }

  const moreFromArtist = show.artistId
    ? await getShowsForArtist(show.artistId, { limit: 6 })
    : [];
  const duration = formatDuration(show.duration);
  const relatedShows = moreFromArtist.filter((item) => item.id !== show.id);
  const stationLabel =
    show.station === "east" ? "EAST" : show.station === "kx" ? "KX" : "KX";
  const locationLabel = show.locationTags.includes("world")
    ? "WORLD"
    : "LONDON";
  const genres = show.genres.slice(0, 3);
  // The raw title trails the date and station name; both already have their own
  // place on this page, so the heading carries the show name alone.
  const displayTitle = formatShowDisplayTitle(show.title);

  return (
    <main id="main-content" className="scroll-mt-24">
      <div className="hidden md:block">
        <PageHero
          eyebrow={`${stationLabel} · ${locationLabel}`}
          title={displayTitle}
          description={show.artist?.name ?? "Voices Radio"}
        />
      </div>

      {/* Mobile: the artwork is the sleeve and everything under it is the
          tape label. The artwork runs full-bleed (-mx-2 cancels the shell's
          px-2) so it reads as deliberately edge-to-edge, while every text
          element sits on one px-5 gutter that matches SupporterBlock further
          down the page. */}
      <section className="md:hidden">
        <div className="relative -mx-2 aspect-square">
          <Image
            src={show.artwork.src}
            alt={show.artwork.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/* Cream station/location chips: the system's "paper label on
              hardware" motif, and the only thing that sits on the artwork. */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-2 font-outfit text-[14px] font-black uppercase leading-none tracking-[1px] text-voicesNext-background">
            <span className="bg-voicesNext-cream px-1.5 py-[3px]">
              {stationLabel}
            </span>
            <span className="bg-voicesNext-cream px-1.5 py-[3px]">
              {locationLabel}
            </span>
          </div>
        </div>

        {/* pb-10 is the section's closing space: the genre chips are the last
            element here, and without it SupporterBlock's top rule lands
            directly on them. */}
        <div className="px-5 pb-10 pt-6">
          <h1 className="text-balance font-outfit text-[28px] font-black uppercase leading-[0.95] text-voicesNext-cream">
            {displayTitle}
          </h1>

          {show.artist && (
            <Link
              href={`/artists/${show.artist.id}`}
              className="mt-2 inline-flex min-h-[44px] items-center font-gabarito text-base font-bold text-voicesNext-cream underline decoration-voicesNext-border underline-offset-4 transition-colors hover:decoration-voicesNext-orange"
            >
              {show.artist.name}
            </Link>
          )}

          {/* Transmission line — reads like a tape spine, and puts date and
              duration on mobile, where they were previously absent. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-asap text-[12px] font-bold uppercase tracking-[0.12em] text-voicesNext-secondary">
            <span>{stationLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{locationLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(show.date)}</span>
            {duration && (
              <>
                <span aria-hidden="true">·</span>
                <span>{duration}</span>
              </>
            )}
          </p>

          <ArchivePlayPanel media={show.archiveMedia} className="mt-5" />

          {show.description && (
            <p className="mt-6 font-gabarito text-base leading-relaxed text-voicesNext-cream">
              {show.description}
            </p>
          )}

          {genres.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex min-h-[36px] items-center rounded-full border border-voicesNext-border px-3 font-asap text-[12px] font-bold uppercase tracking-[0.08em] text-voicesNext-secondary"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto hidden max-w-[1280px] gap-8 px-4 py-10 md:grid md:grid-cols-[minmax(0,420px)_1fr] md:px-8">
        <div className="relative aspect-square overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface">
          <Image
            src={show.artwork.src}
            alt={show.artwork.alt}
            fill
            sizes="(min-width: 768px) 420px, 90vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <dl className="grid gap-3 rounded-voices-sm border border-voicesNext-border p-4 font-asap text-sm font-bold uppercase text-voicesNext-cream sm:grid-cols-3">
            <div>
              <dt className="text-voicesNext-secondary">Date</dt>
              <dd className="mt-1">{formatDate(show.date)}</dd>
            </div>
            <div>
              <dt className="text-voicesNext-secondary">Station</dt>
              <dd className="mt-1">
                {stationLabel} · {locationLabel}
              </dd>
            </div>
            {duration && (
              <div>
                <dt className="text-voicesNext-secondary">Duration</dt>
                <dd className="mt-1">{duration}</dd>
              </div>
            )}
          </dl>

          {show.description && (
            <p className="font-gabarito text-lg leading-relaxed text-voicesNext-cream">
              {show.description}
            </p>
          )}

          {show.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-voicesNext-border px-3 py-2 font-asap text-xs font-bold uppercase text-voicesNext-cream"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {show.artist && (
            <Link
              href={`/artists/${show.artist.id}`}
              className="inline-flex rounded-full border border-voicesNext-border px-4 py-2 font-asap text-sm font-bold uppercase text-voicesNext-cream"
            >
              {show.artist.name}
            </Link>
          )}
          <ArchivePlayPanel
            media={show.archiveMedia}
            className="max-w-[320px]"
          />
        </div>
      </section>

      {relatedShows.length > 0 && (
        <ShowRail
          title={`More from ${show.artist?.name ?? "this artist"}`}
          description="Related matched shows from the same associated artist."
          shows={relatedShows}
        />
      )}
      <SupporterBlock />
    </main>
  );
}
