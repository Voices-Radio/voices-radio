import { ChevronDown } from "lucide-react";
import Link from "next/link";
import ArtistCard from "../components/redesign/artist-card";
import GenreBrowser from "../components/redesign/genre-browser";
import GenreFilterChips from "../components/redesign/genre-filter-chips";
import { getArtists } from "@/lib/voices/api";
import { buildGenreHref, toggleGenre } from "@/lib/voices/genre-filter";
import { isGenreKey, matchesAllGenreKeys } from "@/lib/voices/genre-taxonomy";
import { matchesStationOrLocation } from "@/lib/voices/normalizers";
import {
  getParamArray,
  getSingleParam,
  type VoicesSearchParams,
} from "@/lib/voices/search-params";
import type { VoicesArtist } from "@/lib/voices/types";
import type { Metadata } from "next";
/**
 * Filtered variants (?category=, ?genre=) all consolidate here rather than
 * competing as near-duplicates in the index.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/artists" },
};

const COLLAPSED_LIMIT = 9;
const ARTISTS_BASE_PATH = "/artists";

function sortArtists(artists: VoicesArtist[]) {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name));
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

  const visibleArtists = expanded ? artists : artists.slice(0, COLLAPSED_LIMIT);
  const expandHref = `${buildGenreHref(ARTISTS_BASE_PATH, selectedGenres, {
    expand: sectionKey,
  })}#${sectionKey}`;

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
        <span className="font-asap text-[16px] font-bold lowercase text-voicesNext-cream">
          a → z
        </span>
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
            href={expandHref}
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
  const buildToggleHref = (genreKey: string) =>
    buildGenreHref(ARTISTS_BASE_PATH, toggleGenre(selectedGenres, genreKey));

  if (activeTab === "genres") {
    return (
      <main id="main-content" className="scroll-mt-24">
        <ArtistTabs activeTab="genres" />
        <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-[70px] md:pb-[96px]">
          <GenreBrowser
            selectedGenres={selectedGenres}
            buildToggleHref={buildToggleHref}
          />
        </section>
      </main>
    );
  }

  const artists = await getArtists();
  const activeArtists = sortArtists(
    artists.filter((artist) => artist.isActive),
  );

  if (selectedGenres.length > 0) {
    const filteredArtists = activeArtists.filter((artist) =>
      matchesAllGenreKeys(artist.genres, selectedGenres),
    );
    const singleGenre = selectedGenres.length === 1;
    const genreLabel = singleGenre
      ? selectedGenres[0]
      : `${selectedGenres.length} genres`;

    return (
      <main id="main-content" className="scroll-mt-24">
        <ArtistTabs activeTab="artists" />
        <section className="mx-auto max-w-[1280px] px-4 pt-10 md:px-[70px] md:pt-[54px]">
          <GenreFilterChips
            genres={selectedGenres}
            basePath={ARTISTS_BASE_PATH}
          />
          <details className="group" open={false}>
            <summary className="inline-flex min-h-[35px] w-auto cursor-pointer list-none items-center gap-2 rounded-full border border-voicesNext-cream py-[6px] pl-4 pr-3 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background [&::-webkit-details-marker]:hidden">
              Add another genre
              <ChevronDown
                aria-hidden="true"
                className="size-[14px] stroke-[3px] transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-4">
              <GenreBrowser
                selectedGenres={selectedGenres}
                buildToggleHref={buildToggleHref}
              />
            </div>
          </details>
        </section>
        {filteredArtists.length > 0 ? (
          <ArtistSection
            sectionKey="genre"
            title={genreLabel}
            description={
              singleGenre
                ? "Voices artists, presenters and hosts in this genre."
                : "Voices artists, presenters and hosts in all of these genres."
            }
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
              {singleGenre
                ? "No artists match this genre yet."
                : "No artists match all of these genres. Remove a filter to broaden your search."}
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
