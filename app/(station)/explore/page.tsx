import Link from "next/link";
import ShowCard from "../components/redesign/show-card";
import SupporterBlock from "../components/redesign/supporter-block";
import { getShows } from "@/lib/voices/api";
import { getGenreAliases } from "@/lib/voices/genre-taxonomy";
import type { VoicesShow } from "@/lib/voices/types";
import {
  exploreGenreOptions,
  exploreGenreTaxonomy,
  isGenreKey,
} from "./explore-options";

type ExploreSearchParams = Record<string, string | string[] | undefined>;

const categoryTiles = [
  {
    label: "Music",
    href: "/explore?category=music",
    description: "Recent KX shows and mixes",
  },
  {
    label: "Artists",
    href: "/artists",
    description: "Hosts and selectors",
  },
  {
    label: "Blogs",
    href: "/blog",
    description: "Stories from the station",
  },
  {
    label: "Podcast",
    href: "/podcast",
    description: "Studio bookings and production",
  },
  {
    label: "Agency",
    href: "/agency",
    description: "Programming and talent curation",
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
      className="mx-auto flex max-w-[1280px] items-center gap-8 px-4 py-8 font-gabarito text-[24px] font-bold md:px-[70px] md:py-12 md:text-[34px]"
      aria-label="Explore mode"
    >
      <Link
        href="/explore"
        className={
          activeTab === "explore"
            ? "text-voicesNext-orange"
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
            ? "text-voicesNext-orange"
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
      <div className="grid gap-px bg-voicesNext-border md:grid-cols-5">
        {categoryTiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group min-h-[178px] bg-voicesNext-background p-5 transition-colors hover:bg-voicesNext-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange md:min-h-[220px] md:p-6"
          >
            <span className="font-outfit text-[28px] font-black uppercase leading-none tracking-[1px] text-voicesNext-cream transition-colors group-hover:text-voicesNext-orange md:text-[34px]">
              {tile.label}
            </span>
            <span className="mt-4 block max-w-[180px] font-asap text-[13px] leading-snug text-voicesNext-secondary md:text-[14px]">
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
            className="inline-flex rounded-full border border-voicesNext-cream px-4 py-2 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
      <div className="grid gap-px bg-voicesNext-border md:grid-cols-2 xl:grid-cols-3">
        {exploreGenreOptions.map((primary) => (
          <article
            key={primary}
            className="bg-voicesNext-background p-5 md:p-6"
          >
            <Link
              href={`/explore?category=music&genre=${encodeURIComponent(
                primary,
              )}`}
              className="inline-flex font-outfit text-[24px] font-black uppercase leading-none tracking-[1px] text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            >
              {primary}
            </Link>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.keys(exploreGenreTaxonomy[primary] ?? {}).map(
                (subgenre) => {
                  const genreKey = `${primary} > ${subgenre}`;

                  return (
                    <Link
                      key={genreKey}
                      href={`/explore?category=music&genre=${encodeURIComponent(
                        genreKey,
                      )}`}
                      className="rounded-full border border-voicesNext-border px-3 py-2 font-asap text-[11px] font-bold uppercase leading-none text-voicesNext-secondary transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                    >
                      {subgenre}
                    </Link>
                  );
                },
              )}
            </div>
          </article>
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
    <main>
      <ExploreTabs activeTab={activeTab} />
      {activeTab === "genres" ? (
        <GenresScreen />
      ) : (
        <>
          <CategoryTiles />
          {showMusicGrid && (
            <MusicGrid shows={visibleShows} selectedGenres={selectedGenres} />
          )}
        </>
      )}
      <SupporterBlock />
    </main>
  );
}
