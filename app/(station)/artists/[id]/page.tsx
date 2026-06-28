import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHero from "../../components/redesign/page-hero";
import ShowGrid from "../../components/redesign/show-grid";
import { getArtist, getShowsForArtist } from "@/lib/voices/api";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const artist = await getArtist(params.id).catch(() => null);

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
}: {
  params: { id: string };
}) {
  const artist = await getArtist(params.id).catch(() => null);

  if (!artist) {
    notFound();
  }

  const shows = await getShowsForArtist(artist.id);
  const links = getArtistLinks(artist);

  return (
    <main>
      <PageHero
        eyebrow="Artist"
        title={artist.name}
        description={artist.bio || "Voices Radio artist profile."}
      />
      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-[minmax(0,360px)_1fr] md:px-8">
        <div className="relative aspect-square overflow-hidden rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface">
          <Image
            src={artist.imageUrl ?? "/VOICESLOGO_LIGHTBOX.png"}
            alt={artist.imageUrl ? artist.name : "Voices Radio"}
            fill
            sizes="(min-width: 768px) 360px, 90vw"
            priority
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
    </main>
  );
}
