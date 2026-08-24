import { ChevronDown } from "lucide-react";
import Link from "next/link";
import ShowCard from "../components/redesign/show-card";
import SupporterBlock from "../components/redesign/supporter-block";
import { getShows } from "@/lib/voices/api";
import { getGenreAliases } from "@/lib/voices/genre-taxonomy";
import type { VoicesShow } from "@/lib/voices/types";
import {
  exploreGenreOptions,
  exploreGenreTaxonomy,
  getGenreKey,
  isGenreKey,
} from "./explore-options";

type ExploreSearchParams = Record<string, string | string[] | undefined>;

const categoryTiles = [
  {
    label: "Music",
    href: "/explore?category=music",
    description: "Recent KX shows and mixes",
    index: "01",
    tag: "Listen back",
  },
  {
    label: "Artists",
    href: "/artists",
    description: "Hosts and selectors",
    index: "02",
    tag: "Residents",
  },
  {
    label: "Blogs",
    href: "/blog",
    description: "Stories from the station",
    index: "03",
    tag: "Editorial",
  },
  {
    label: "Podcast",
    href: "/podcast",
    description: "Studio bookings and production",
    index: "04",
    tag: "Studio",
    opensInNewTab: true,
  },
  {
    label: "Agency",
    href: "/agency",
    description: "Programming and talent curation",
    index: "05",
    tag: "Curation",
    opensInNewTab: true,
  },
];

function getParamArray(
  searchParams: ExploreSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getSingleParam(
  searchParams: ExploreSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFilterValue(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesGenres(show: VoicesShow, selectedGenres: string[]) {
  if (!selectedGenres.length) return true;
  const showGenres = show.genres.map(normalizeFilterValue).filter(Boolean);
  if (!showGenres.length) return false;

  return selectedGenres.some((genre) => {
    const targets = getGenreAliases(genre).map(normalizeFilterValue);
    return targets.some((target) => showGenres.includes(target));
  });
}

function isKxExploreShow(show: VoicesShow) {
  return show.station !== "east" && !show.locationTags.includes("east");
}

function sortShows(shows: VoicesShow[]) {
  return [...shows].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;

    return bTime - aTime;
  });
}

function ExploreTabs({ activeTab }: { activeTab: "explore" | "genres" }) {
  return (
    <nav
      className="mx-auto flex max-w-[1280px] items-center gap-7 px-4 py-[19px] font-gabarito text-[18px] font-bold md:px-[70px] md:py-[30px] md:text-[20px]"
      aria-label="Explore mode"
    >
      <Link
        href="/explore"
        className={
          activeTab === "explore"
            ? "text-voicesNext-orangeText"
            : "text-voicesNext-secondary"
        }
        aria-current={activeTab === "explore" ? "page" : undefined}
      >
        Explore
      </Link>
      <Link
        href="/explore?tab=genres"
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

function CategoryTiles() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-12 md:px-[70px] md:pb-20">
      <div className="grid gap-px bg-voicesNext-border sm:grid-cols-2 lg:grid-cols-5">
        {categoryTiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            target={tile.opensInNewTab ? "_blank" : undefined}
            rel={tile.opensInNewTab ? "noopener noreferrer" : undefined}
            className="group grid min-h-[162px] grid-rows-[auto_1fr_auto] bg-voicesNext-background p-4 transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange md:min-h-[196px] md:p-5"
          >
            <span className="flex items-center justify-between gap-3 font-asap text-[10px] font-bold uppercase leading-none tracking-[1px] text-voicesNext-secondary transition-colors group-hover:text-voicesNext-background/60">
              <span>{tile.index}</span>
              <span>{tile.tag}</span>
            </span>
            <span className="flex items-center py-5">
              <span className="font-outfit text-[26px] font-black uppercase leading-none tracking-[1px] text-voicesNext-cream transition-colors group-hover:text-voicesNext-background md:text-[30px]">
                {tile.label}
              </span>
            </span>
            <span className="border-t border-voicesNext-border pt-3 font-asap text-[12px] leading-snug text-voicesNext-secondary transition-colors group-hover:border-voicesNext-background/25 group-hover:text-voicesNext-background/70 md:text-[13px]">
              {tile.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MusicGrid({
  shows,
  selectedGenres,
}: {
  shows: VoicesShow[];
  selectedGenres: string[];
}) {
  const title = selectedGenres.length
    ? selectedGenres[selectedGenres.length - 1]
    : "Music";

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-[70px] md:pb-[96px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-[30px]">
        <div>
          <h1 className="font-gabarito text-[24px] font-bold leading-none text-voicesNext-cream md:text-[34px]">
            {title}
          </h1>
          <p className="mt-2 font-asap text-[13px] leading-tight text-voicesNext-secondary md:text-[14px]">
            The latest Voices KX shows.
          </p>
        </div>
        {selectedGenres.length > 0 && (
          <Link
            href="/explore?tab=genres"
            className="inline-flex rounded-full border border-voicesNext-cream px-4 py-2 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            Change genre
          </Link>
        )}
      </div>

      {shows.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shows.map((show, index) => (
            <ShowCard key={show.id} show={show} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="border border-voicesNext-border p-6 font-gabarito text-voicesNext-secondary">
          No KX shows match this genre yet.
        </div>
      )}
    </section>
  );
}

function GenresScreen() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-[70px] md:pb-[96px]">
      <div className="max-w-[760px] space-y-3 md:space-y-4">
        {exploreGenreOptions.map((genre) => (
          <details key={genre} className="group w-full">
            <summary className="inline-flex min-h-[35px] w-auto max-w-full cursor-pointer list-none items-center rounded-full border-2 border-voicesNext-cream text-left font-asap text-[18px] font-bold leading-none text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 truncate py-[6px] pl-[13px] pr-[15px]">
                {genre}
              </span>
              <span
                aria-hidden="true"
                className="mr-[3px] inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current"
              >
                <ChevronDown className="size-[15px] stroke-[4px] transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-2 pl-4">
              <Link
                href={`/explore?category=music&genre=${encodeURIComponent(
                  genre,
                )}`}
                className="inline-flex min-h-[31px] items-center justify-center rounded-full border border-voicesNext-orange bg-voicesNext-cream px-[10px] py-1 font-asap text-[16px] font-bold uppercase leading-none text-voicesNext-orange transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[22px] md:min-h-0 md:px-4 md:py-0 md:text-[12px]"
              >
                All
              </Link>
              {Object.keys(exploreGenreTaxonomy[genre] ?? {}).map(
                (subgenre) => {
                  const key = getGenreKey(genre, subgenre);

                  return (
                    <Link
                      key={key}
                      href={`/explore?category=music&genre=${encodeURIComponent(
                        key,
                      )}`}
                      className="inline-flex min-h-[31px] items-center justify-center rounded-full border border-voicesNext-cream px-[10px] py-1 font-asap text-[16px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[22px] md:min-h-0 md:px-4 md:py-0 md:text-[12px]"
                    >
                      {subgenre}
                    </Link>
                  );
                },
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<ExploreSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab =
    getSingleParam(resolvedSearchParams, "tab") === "genres"
      ? "genres"
      : "explore";
  const selectedGenres = getParamArray(resolvedSearchParams, "genre").filter(
    isGenreKey,
  );
  const category = getSingleParam(resolvedSearchParams, "category");
  const showMusicGrid = category === "music" || selectedGenres.length > 0;

  const shows = showMusicGrid
    ? await getShows({
        genres: selectedGenres,
        limit: 100,
      })
    : [];
  const visibleShows = sortShows(
    shows.filter(
      (show) => isKxExploreShow(show) && matchesGenres(show, selectedGenres),
    ),
  ).slice(0, 16);

  return (
    <main id="main-content" className="scroll-mt-24">
      <ExploreTabs activeTab={activeTab} />
      {activeTab === "genres" ? (
        <GenresScreen />
      ) : (
        <>
          {!showMusicGrid && <CategoryTiles />}
          {showMusicGrid && (
            <MusicGrid shows={visibleShows} selectedGenres={selectedGenres} />
          )}
        </>
      )}
      <SupporterBlock />
    </main>
  );
}
