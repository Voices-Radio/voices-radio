import Link from "next/link";
import ExploreFilters from "./explore-filters";
import { exploreGenreOptions, isGenreKey } from "./explore-options";
import ExploreShowSection from "./explore-show-section";
import {
  ExploreFilterTransitionProvider,
  ExploreResultsTransition,
} from "./explore-filter-transition";
import SupporterBlock from "../components/redesign/supporter-block";
import { getShows } from "@/lib/voices/api";
import { matchesStationOrLocation } from "@/lib/voices/normalizers";
import { getGenreAliases } from "@/lib/voices/genre-taxonomy";
import type { VoicesShow } from "@/lib/voices/types";

type ExploreSearchParams = Record<string, string | string[] | undefined>;

const stationFilters = ["kx", "east"] as const;
const locationFilters = ["london", "world"] as const;

function getParamArray(
  searchParams: ExploreSearchParams | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
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

function matchesSelectedLocations(
  show: VoicesShow,
  selectedLocations: string[],
) {
  if (!selectedLocations.length) return true;

  return selectedLocations.some((location) =>
    show.locationTags.includes(location),
  );
}

function matchesSectionStation(show: VoicesShow, station: "kx" | "east") {
  return matchesStationOrLocation(show, station);
}

function matchesSectionWithFallback(
  show: VoicesShow,
  station: "kx" | "east",
  index: number,
) {
  const hasStationMatch =
    matchesSectionStation(show, "kx") || matchesSectionStation(show, "east");

  if (hasStationMatch) {
    return matchesSectionStation(show, station);
  }

  return station === (index % 2 === 0 ? "kx" : "east");
}

function sortShows(shows: VoicesShow[]) {
  return [...shows].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;

    return bTime - aTime;
  });
}

function GenreBlock() {
  return (
    <section className="mx-auto max-w-[1180px] bg-voicesNext-surface px-4 py-[43px] text-center md:px-[202px]">
      <h2 className="font-gabarito text-[24px] font-bold uppercase text-voicesNext-cream">
        Discover Shows By Genre
      </h2>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {exploreGenreOptions.map((genre) => (
          <Link
            key={genre}
            href={`/explore?genre=${encodeURIComponent(genre)}`}
            className="rounded-full border border-voicesNext-cream px-2 py-2 font-asap text-[16px] font-bold leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
          >
            {genre}
          </Link>
        ))}
      </div>
      <Link
        href="/explore"
        className="mt-8 inline-flex font-gabarito text-[16px] font-medium uppercase text-voicesNext-cream"
      >
        Browse All Genres
      </Link>
    </section>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: ExploreSearchParams;
}) {
  const selectedGenres = getParamArray(searchParams, "genre").filter(
    isGenreKey,
  );
  const selectedStations = getParamArray(searchParams, "station").filter(
    (station) =>
      stationFilters.includes(station as (typeof stationFilters)[number]),
  );
  const selectedLocations = getParamArray(searchParams, "location").filter(
    (location) =>
      locationFilters.includes(location as (typeof locationFilters)[number]),
  );

  const shows = await getShows({ genres: selectedGenres, limit: 100 });
  const filteredShows = sortShows(
    shows.filter(
      (show) =>
        matchesGenres(show, selectedGenres) &&
        matchesSelectedLocations(show, selectedLocations),
    ),
  );

  const visibleSections = (
    selectedStations.length ? selectedStations : [...stationFilters]
  ).filter((station): station is "kx" | "east" =>
    stationFilters.includes(station as (typeof stationFilters)[number]),
  );

  const sectionCopy = {
    kx: {
      title: "Voices KX",
      description: "Browse shows from our Kings Cross studio.",
    },
    east: {
      title: "Voices EAST",
      description: "Browse shows from our Hackney Wick studio.",
    },
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    selectedStations.length > 0 ||
    selectedLocations.length > 0;

  return (
    <main>
      <ExploreFilterTransitionProvider>
        <ExploreFilters
          selectedGenres={selectedGenres}
          selectedStations={selectedStations}
          selectedLocations={selectedLocations}
        />
        <ExploreResultsTransition>
          <div className="space-y-16 pb-16 md:space-y-[86px] md:pb-[96px]">
            {visibleSections.map((station) => {
              const sectionShows = filteredShows.filter((show, index) =>
                matchesSectionWithFallback(show, station, index),
              );

              return (
                <ExploreShowSection
                  key={station}
                  title={sectionCopy[station].title}
                  description={sectionCopy[station].description}
                  shows={sectionShows}
                  emptyMessage={
                    hasActiveFilters
                      ? "No shows match these filters yet."
                      : "No matched shows are available for this section yet."
                  }
                />
              );
            })}
          </div>
        </ExploreResultsTransition>
      </ExploreFilterTransitionProvider>
      <div className="px-4 py-10 md:px-[50px]">
        <GenreBlock />
      </div>
      <SupporterBlock />
    </main>
  );
}
