import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ExpandableBio from "../../components/redesign/expandable-bio";
import PageHero from "../../components/redesign/page-hero";
import SaveArtistButton from "../../components/redesign/save-artist-button";
import ShowGrid from "../../components/redesign/show-grid";
import ShowRail from "../../components/redesign/show-rail";
import SupporterBlock from "../../components/redesign/supporter-block";
import { getArtist, getShowsForArtist } from "@/lib/voices/api";
import { getArtistLinks } from "@/lib/voices/artist-links";

type ArtistPageProps = {
  params: Promise<{ id: string }>;
};

// Bios now carry real line breaks (voices_backend's ArtistMirror/ArtistSync
// preserve them end to end), but a <meta name="description"> is a single
// attribute value — line breaks there are just whitespace to collapse, not
// something a search snippet or share card benefits from keeping.
function toMetaDescription(bio: string | undefined | null, fallback: string) {
  return bio ? bio.replace(/\s+/g, " ").trim() || fallback : fallback;
}

// Rendered on first request, then served from cache and refreshed in the
// background. The upstream fetches already cache for 5 minutes, so rendering
// per request only added latency.
export const revalidate = 300;

// No pages are prebuilt (the catalogue is large and changes daily), but exporting
// this opts the route into ISR: each id renders once on first request, then
// is cached. Without it a dynamic segment is rendered on every request.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    return { title: "Artist not found" };
  }

  const description = toMetaDescription(
    artist.bio,
    `Explore shows and profile details for ${artist.name}.`,
  );

  return {
    title: `${artist.name} | Voices Radio`,
    description,
    alternates: { canonical: `/artists/${id}` },
    openGraph: {
      title: artist.name,
      description,
      images: artist.imageUrl ? [{ url: artist.imageUrl }] : undefined,
    },
  };
}

export default async function ArtistDetailPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    notFound();
  }

  const shows = await getShowsForArtist(artist.id);
  const links = getArtistLinks(artist);
  const stationLabel =
    artist.station === "east" ? "EAST" : artist.station === "kx" ? "KX" : "KX";
  const locationLabel = artist.locationTags.includes("world")
    ? "WORLD"
    : "LONDON";
  const mobileGenres = artist.genres.slice(0, 3);

  return (
    <main id="main-content" className="scroll-mt-24">
      <div className="hidden md:block">
        <PageHero
          eyebrow="Artist"
          title={artist.name}
          subtitle={artist.showName}
          meta={<SaveArtistButton artistId={artist.id} name={artist.name} />}
        />
      </div>

      <section className="md:hidden">
        <div className="relative h-[381px] overflow-hidden border border-voicesNext-cream bg-voicesNext-surface">
          <Image
            src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artist.imageUrl ? artist.name : "Voices Radio"}
            fill
            sizes="calc(100vw - 16px)"
            className="object-cover object-[50%_25%]"
          />
          <span className="absolute left-[121px] top-[27px] bg-voicesNext-cream px-2 py-[2px] font-outfit text-[11px] font-black uppercase leading-none text-voicesNext-background">
            Host
          </span>
          <div className="absolute right-2 top-[9px] flex flex-col items-end gap-[7px] font-outfit text-[13px] font-black uppercase leading-none text-[#443f3f]">
            <span className="bg-voicesNext-cream px-1 py-[3px]">
              {stationLabel}
            </span>
            <span className="bg-voicesNext-cream px-1 py-[3px]">Resident</span>
            <span className="bg-voicesNext-cream px-1 py-[3px]">
              {locationLabel}
            </span>
          </div>
          {artist.showName && (
            <p className="mt-3 font-gabarito text-base font-bold text-voicesNext-orange">
              {artist.showName}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-[360px] px-0 py-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-outfit text-[32px] font-black uppercase leading-none text-voicesNext-cream">
              {artist.name}
            </h1>
            <SaveArtistButton
              artistId={artist.id}
              name={artist.name}
              className="-mr-2 shrink-0"
            />
          </div>
          {artist.bio && <ExpandableBio bio={artist.bio} />}
          {mobileGenres.length > 0 && (
            <div className="mt-10">
              <p className="font-asap text-[16px] text-voicesNext-cream">
                Most played genres:
              </p>
              <div className="mt-2 flex flex-wrap gap-[7px]">
                {mobileGenres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-voicesNext-cream px-2 py-1 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-orange"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto hidden max-w-[1280px] px-4 py-10 md:block md:px-8">
        <div className="grid grid-cols-[minmax(0,360px)_1fr] gap-8 lg:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface">
            <Image
              src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
              alt={artist.imageUrl ? artist.name : "Voices Radio"}
              fill
              sizes="(min-width: 768px) 360px, 90vw"
              className="object-cover object-[50%_25%]"
            />
          </div>
          <div className="min-w-0 space-y-6">
            <p className="max-w-3xl whitespace-pre-line font-gabarito text-lg leading-relaxed text-voicesNext-cream">
              {artist.bio || "Voices Radio artist profile."}
            </p>

            {artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artist.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-voicesNext-border px-3 py-2 font-asap text-xs font-bold uppercase text-voicesNext-cream"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-voicesNext-orange px-4 py-2 font-asap text-xs font-bold uppercase text-voicesNext-background"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-6 mt-12 font-gabarito text-3xl font-bold">Shows</h2>
        <ShowGrid shows={shows} columns={4} />
      </section>

      <div className="md:hidden">
        <ShowRail title="Recent Episodes" description="" shows={shows} />
      </div>
      <SupporterBlock />
    </main>
  );
}
