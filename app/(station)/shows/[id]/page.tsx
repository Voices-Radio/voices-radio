import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "../../components/redesign/page-hero";
import ShowRail from "../../components/redesign/show-rail";
import { getShow, getShowsForArtist } from "@/lib/voices/api";
import MixcloudArchivePlayer from "../../components/redesign/mixcloud-archive-player";

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

export default async function ShowDetailPage({
  params,
}: ShowPageProps) {
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

  return (
    <main>
      <PageHero
        eyebrow={show.platform ?? "Archive"}
        title={show.title}
        description={show.artist?.name ?? "Voices Radio"}
      />

      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-[minmax(0,420px)_1fr] md:px-8">
        <div className="relative aspect-square overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface">
          <Image
            src={show.artwork.src}
            alt={show.artwork.alt}
            fill
            sizes="(min-width: 768px) 420px, 90vw"
            priority
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
          {show.mixcloudUrl && (
            <MixcloudArchivePlayer title={show.title} url={show.mixcloudUrl} />
          )}
          {show.archiveUrl && (
            <a
              href={show.archiveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-voicesNext-orange px-5 py-3 font-asap text-sm font-bold uppercase text-voicesNext-background"
            >
              Open archive source
            </a>
          )}
        </div>
      </section>

      {relatedShows.length > 0 && (
        <ShowRail
          title={`More from ${show.artist?.name ?? "this artist"}`}
          description="Related matched shows from the same associated artist."
          shows={relatedShows}
        />
      )}
    </main>
  );
}
