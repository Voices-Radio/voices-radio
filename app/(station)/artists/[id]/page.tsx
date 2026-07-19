import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHero from "../../components/redesign/page-hero";
import ShowGrid from "../../components/redesign/show-grid";
import ShowRail from "../../components/redesign/show-rail";
import SupporterBlock from "../../components/redesign/supporter-block";
import { getArtist, getShowsForArtist } from "@/lib/voices/api";

type ArtistPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const artist = await getArtist(id).catch(() => null);

  if (!artist) {
    return { title: "Artist not found" };
  }

  return {
    title: `${artist.name} | Voices Radio`,
    description:
      artist.bio || `Explore shows and profile details for ${artist.name}.`,
    openGraph: {
      title: artist.name,
      description:
        artist.bio || `Explore shows and profile details for ${artist.name}.`,
      images: artist.imageUrl ? [{ url: artist.imageUrl }] : undefined,
    },
  };
}

function getArtistLinks(artist: Awaited<ReturnType<typeof getArtist>>) {
  return [
    artist.mixcloudUsername && {
      label: "Mixcloud",
      href: `https://www.mixcloud.com/${artist.mixcloudUsername.replace(
        /^@/,
        "",
      )}/`,
    },
    artist.soundcloudUsername && {
      label: "SoundCloud",
      href: artist.soundcloudUsername.startsWith("http")
        ? artist.soundcloudUsername
        : `https://soundcloud.com/${artist.soundcloudUsername.replace(
            /^@/,
            "",
          )}`,
    },
    artist.socialLinks.instagram && {
      label: "Instagram",
      href: artist.socialLinks.instagram,
    },
    artist.socialLinks.website && {
      label: "Website",
      href: artist.socialLinks.website,
    },
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}

export default async function ArtistDetailPage({
  params,
}: ArtistPageProps) {
  const { id } = await params;
  const artist = await getArtist(id).catch(() => null);

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
    <main>
      <div className="hidden md:block">
        <PageHero
          eyebrow="Artist"
          title={artist.name}
          description={artist.bio || "Voices Radio artist profile."}
        />
      </div>

      <section className="md:hidden">
        <div className="relative h-[381px] overflow-hidden border border-voicesNext-cream bg-voicesNext-surface">
          <Image
            src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artist.imageUrl ? artist.name : "Voices Radio"}
            fill
            sizes="calc(100vw - 16px)"
            className="object-cover"
          />
          <span className="absolute left-[121px] top-[27px] bg-voicesNext-cream px-2 py-[2px] font-outfit text-[11px] font-black uppercase leading-none text-voicesNext-background">
            Host
          </span>
          <div className="absolute right-2 top-[9px] flex flex-col items-end gap-[7px] font-outfit text-[13px] font-black uppercase leading-none text-[#443f3f]">
            <span className="bg-voicesNext-cream px-1 py-[3px]">
              {stationLabel}
            </span>
            <span className="bg-voicesNext-cream px-1 py-[3px]">
              Resident
            </span>
            <span className="bg-voicesNext-cream px-1 py-[3px]">
              {locationLabel}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[360px] px-0 py-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-outfit text-[32px] font-black uppercase leading-none text-voicesNext-cream">
              {artist.name}
            </h1>
            <span
              className="text-[28px] leading-none text-voicesNext-orange"
              aria-hidden="true"
            >
              ♡
            </span>
          </div>
          {artist.bio && (
            <>
              <p className="mt-5 line-clamp-5 max-w-[313px] font-asap text-[16px] leading-normal text-voicesNext-cream">
                {artist.bio}
              </p>
              <p className="mt-[10px] font-asap text-[16px] font-bold leading-none text-voicesNext-orange">
                (Read more)
              </p>
            </>
          )}
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

      <section className="mx-auto hidden max-w-[1280px] gap-8 px-4 py-10 md:grid md:grid-cols-[minmax(0,360px)_1fr] md:px-8">
        <div className="relative aspect-square overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface">
          <Image
            src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artist.imageUrl ? artist.name : "Voices Radio"}
            fill
            sizes="(min-width: 768px) 360px, 90vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
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

          <h2 className="font-gabarito text-3xl font-bold">Shows</h2>
          <ShowGrid shows={shows} />
        </div>
      </section>

      <div className="md:hidden">
        <ShowRail
          title="Recent Episodes"
          description=""
          shows={shows}
        />
      </div>
      <SupporterBlock />
    </main>
  );
}
