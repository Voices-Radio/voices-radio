import Link from "next/link";
import ArtistCard from "../components/redesign/artist-card";
import GenreBrowser from "../components/redesign/genre-browser";
import { getArtists } from "@/lib/voices/api";
import { isGenreKey, matchesGenreKeys } from "@/lib/voices/genre-taxonomy";
import { matchesStationOrLocation } from "@/lib/voices/normalizers";
import {
  getParamArray,
  getSingleParam,
  type VoicesSearchParams,
} from "@/lib/voices/search-params";
import type { VoicesArtist } from "@/lib/voices/types";

const COLLAPSED_LIMIT = 9;

function sortArtists(artists: VoicesArtist[]) {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name));
}

function buildGenreHref(genreKey: string) {
  return `/artists?genre=${encodeURIComponent(genreKey)}`;
}

function ArtistTabs({ activeTab }: { activeTab: "artists" | "genres" }) {
  return (
    <nav
      className="mx-auto flex max-w-[1280px] items-center gap-7 px-4 py-[19px] font-gabarito text-[18px] font-bold md:px-[70px] md:py-[30px] md:text-[20px]"
      aria-label="Artists mode"
    >
      <Link
        href="/artists"
        className={
          activeTab === "artists"
            ? "text-voicesNext-orangeText"
            : "text-voicesNext-secondary"
        }
        aria-current={activeTab === "artists" ? "page" : undefined}
      >
        Artists
      </Link>
      <Link
        href="/artists?tab=genres"
        className={
          activeTab === "genres"
            ? "text-voicesNext-orangeText"
            : "text-voicesNext-secondary"
        }
        aria-current={activeTab === "genres" ? "page" : undefined}
      >
        Genres
      </Link>
    </nav>
  );
}

function ArtistSection({
  sectionKey,
  title,
  description,
  artists,
  expanded,
  selectedGenres,
}: {
  sectionKey: string;
  title: string;
  description: string;
  artists: VoicesArtist[];
  expanded: boolean;
  selectedGenres: string[];
}) {
  if (!artists.length) return null;

  const visibleArtists = expanded
    ? artists
    : artists.slice(0, COLLAPSED_LIMIT);
  const expandParams = new URLSearchParams();
  selectedGenres.forEach((genre) => expandParams.append("genre", genre));
  expandParams.set("expand", sectionKey);

  return (
    <section
      id={sectionKey}
      className="mx-auto max-w-[1280px] scroll-mt-24 px-4 py-10 md:px-[70px] md:py-[54px]"
    >
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-gabarito text-[24px] font-bold leading-none text-voicesNext-cream">
            {title}
          </h1>
          <p className="mt-2 font-asap text-[14px] text-voicesNext-secondary">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedGenres.length > 0 && (
            <Link
              href="/artists?tab=genres"
              className="inline-flex rounded-full border border-voicesNext-cream px-4 py-2 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
            >
              Change genre
            </Link>
          )}
          <span className="font-asap text-[16px] font-bold lowercase text-voicesNext-cream">
            a → z
          </span>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visibleArtists.map((artist) => (
          <div key={artist.id} className="h-[350px] w-full max-w-[350px]">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
      {!expanded && artists.length > COLLAPSED_LIMIT && (
        <div className="mt-10 text-center">
          <Link
            href={`/artists?${expandParams.toString()}#${sectionKey}`}
            className="inline-flex rounded-full border border-voicesNext-cream px-[17px] py-1 font-asap text-[16px] font-bold uppercase text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            Load More
          </Link>
        </div>
      )}
    </section>
  );
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams?: Promise<VoicesSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab =
    getSingleParam(resolvedSearchParams, "tab") === "genres"
      ? "genres"
      : "artists";
  const selectedGenres = getParamArray(resolvedSearchParams, "genre").filter(
    isGenreKey,
  );
  const expand = getSingleParam(resolvedSearchParams, "expand");

  if (activeTab === "genres") {
    return (
      <main id="main-content" className="scroll-mt-24">
        <ArtistTabs activeTab="genres" />
        <GenreBrowser buildHref={buildGenreHref} />
      </main>
    );
  }

  const artists = await getArtists();
  const activeArtists = sortArtists(
    artists.filter((artist) => artist.isActive),
  );

  if (selectedGenres.length > 0) {
    const filteredArtists = activeArtists.filter((artist) =>
      matchesGenreKeys(artist.genres, selectedGenres),
    );
    const genreLabel = selectedGenres[selectedGenres.length - 1];

    return (
      <main id="main-content" className="scroll-mt-24">
        <ArtistTabs activeTab="artists" />
        {filteredArtists.length > 0 ? (
          <ArtistSection
            sectionKey="genre"
            title={genreLabel}
            description="Voices artists, presenters and hosts in this genre."
            artists={filteredArtists}
            expanded={expand === "genre"}
            selectedGenres={selectedGenres}
          />
        ) : (
          <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-[70px] md:py-[54px]">
            <div className="mb-[30px]">
              <h1 className="font-gabarito text-[24px] font-bold leading-none text-voicesNext-cream">
                {genreLabel}
              </h1>
            </div>
            <div className="border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
              No artists match this genre yet.{" "}
              <Link
                href="/artists?tab=genres"
                className="underline hover:text-voicesNext-cream"
              >
                Choose another genre
              </Link>
              .
            </div>
          </section>
        )}
      </main>
    );
  }

  const kxArtists = activeArtists.filter((artist) =>
    matchesStationOrLocation(artist, "kx"),
  );
  const eastArtists = activeArtists.filter((artist) =>
    matchesStationOrLocation(artist, "east"),
  );
  const hasExplicitStationGroups =
    kxArtists.length > 0 || eastArtists.length > 0;

  return (
    <main id="main-content" className="scroll-mt-24">
      <ArtistTabs activeTab="artists" />
      {hasExplicitStationGroups ? (
        <>
          <ArtistSection
            sectionKey="kx"
            title="Voices KX"
            description="Browse the hosts at our Kings Cross studio."
            artists={kxArtists}
            expanded={expand === "kx" || expand === "all"}
            selectedGenres={selectedGenres}
          />
          <ArtistSection
            sectionKey="east"
            title="Voices EAST"
            description="Browse the hosts at our Hackney Wick studio."
            artists={eastArtists}
            expanded={expand === "east" || expand === "all"}
            selectedGenres={selectedGenres}
          />
        </>
      ) : (
        <ArtistSection
          sectionKey="all"
          title="Artists"
          description="Browse all Voices artists, presenters and hosts."
          artists={activeArtists}
          expanded={expand === "all"}
          selectedGenres={selectedGenres}
        />
      )}
    </main>
  );
}
