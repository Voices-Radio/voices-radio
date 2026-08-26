import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../components/redesign/page-hero";
import ArchivePlayPanel from "../../components/redesign/archive-play-panel";
import ShowRail from "../../components/redesign/show-rail";
import SupporterBlock from "../../components/redesign/supporter-block";
import { getShow, getShowsForArtist } from "@/lib/voices/api";

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

  return {
    title: `${show.title} | Voices Radio`,
    description:
      show.description || `Listen back to ${show.title} on Voices Radio.`,
    openGraph: {
      title: show.title,
      description:
        show.description || `Listen back to ${show.title} on Voices Radio.`,
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

  return (
    <main id="main-content" className="scroll-mt-24">
      <div className="hidden md:block">
        <PageHero
          eyebrow={show.platform ?? "Archive"}
          title={show.title}
          description={show.artist?.name ?? "Voices Radio"}
        />
      </div>

      <section className="px-1 pt-5 md:hidden">
        <div className="relative h-[388px]">
          <div className="relative h-[377px] overflow-hidden rounded-[4px]">
            <Image
              src={show.artwork.src}
              alt={show.artwork.alt}
              fill
              sizes="calc(100vw - 8px)"
              className="object-cover"
            />
            <div className="absolute right-2 top-2 flex flex-col items-end gap-2 font-outfit text-[14px] font-black uppercase leading-none tracking-[1px] text-voicesNext-background">
              <span className="bg-voicesNext-cream px-1 py-[2px]">
                {stationLabel}
              </span>
              <span className="bg-voicesNext-cream px-1 py-[2px]">
                {locationLabel}
              </span>
            </div>
            <div className="absolute bottom-[25px] left-0 w-[320px] rounded-r-[10px] bg-voicesNext-orange/90 pb-4 pl-4 pr-3 pt-[10px] text-voicesNext-cream">
              <h1 className="truncate font-gabarito text-[24px] font-bold leading-none">
                {show.title}
              </h1>
              {genres.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-[7px] font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-orange">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-voicesNext-cream px-2 py-1"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 flex h-2 -translate-x-1/2 items-center gap-1">
            <span className="size-1 rounded-full bg-voicesNext-cream/70" />
            <span className="size-1.5 rounded-full bg-voicesNext-cream/80" />
            <span className="size-2 rounded-full bg-voicesNext-cream" />
            <span className="size-1.5 rounded-full bg-voicesNext-cream/80" />
            <span className="size-1 rounded-full bg-voicesNext-cream/70" />
          </div>
        </div>

        {show.description && (
          <p className="mx-auto mt-5 max-w-[365px] font-asap text-[16px] leading-normal text-voicesNext-cream">
            {show.description}
          </p>
        )}

        <div className="mx-auto mt-6 max-w-[365px]">
          <ArchivePlayPanel media={show.archiveMedia} />
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
              <dt className="text-voicesNext-secondary">Platform</dt>
              <dd className="mt-1">{show.platform ?? "Archive"}</dd>
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
          <ArchivePlayPanel media={show.archiveMedia} />
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
