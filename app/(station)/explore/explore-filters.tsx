"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  exploreGenreOptions,
  exploreGenreTaxonomy,
  getGenreKey,
} from "./explore-options";
import { useExploreFilterTransition } from "./explore-filter-transition";

const stationOptions = [
  { label: "KX", value: "kx" },
  { label: "EAST", value: "east" },
];

const locationOptions = [
  { label: "LONDON", value: "london" },
  { label: "WORLD", value: "world" },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toggleGenre(values: string[], primary: string, subgenre?: string) {
  const leafPrefix = `${primary} > `;
  const withoutBranch = values.filter(
    (value) => value !== primary && !value.startsWith(leafPrefix),
  );

  if (!subgenre) {
    return values.includes(primary)
      ? withoutBranch
      : [...withoutBranch, primary];
  }

  const key = getGenreKey(primary, subgenre);
  const currentLeaves = values.filter((value) => value.startsWith(leafPrefix));
  const nextLeaves = toggleValue(currentLeaves, key);
  return [...withoutBranch, ...nextLeaves];
}

function FilterPill({
  active,
  children,
  disabled = false,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[22px] items-center justify-center rounded-full border border-voicesNext-cream px-4 font-asap text-[12px] font-bold uppercase leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
        active
          ? "bg-voicesNext-cream text-voicesNext-background"
          : "text-voicesNext-cream hover:bg-voicesNext-cream hover:text-voicesNext-background",
      )}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function getGenreControlId(genre: string) {
  return genre.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function ExploreFilters({
  selectedGenres,
  selectedStations,
  selectedLocations,
}: {
  selectedGenres: string[];
  selectedStations: string[];
  selectedLocations: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startFilterTransition } = useExploreFilterTransition();
  const [genresOpen, setGenresOpen] = useState(false);
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState(selectedGenres);
  const [stations, setStations] = useState(selectedStations);
  const [locations, setLocations] = useState(selectedLocations);
  const hasActiveFilters =
    genres.length > 0 || stations.length > 0 || locations.length > 0;

  useEffect(() => {
    setGenres(selectedGenres);
    setStations(selectedStations);
    setLocations(selectedLocations);
  }, [selectedGenres, selectedStations, selectedLocations]);

  function navigate(
    nextGenres: string[],
    nextStations: string[],
    nextLocations: string[],
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("genre");
    params.delete("station");
    params.delete("location");
    nextGenres.forEach((genre) => params.append("genre", genre));
    nextStations.forEach((station) => params.append("station", station));
    nextLocations.forEach((location) => params.append("location", location));
    const query = params.toString();

    startFilterTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function updateGenres(nextGenres: string[]) {
    setGenres(nextGenres);
    setGenresOpen(false);
    setExpandedGenre(null);
    navigate(nextGenres, stations, locations);
  }

  function updateStations(nextStations: string[]) {
    setStations(nextStations);
    navigate(genres, nextStations, locations);
  }

  function updateLocations(nextLocations: string[]) {
    setLocations(nextLocations);
    navigate(genres, stations, nextLocations);
  }

  function clearFilters() {
    setGenres([]);
    setStations([]);
    setLocations([]);
    setGenresOpen(false);
    setExpandedGenre(null);
    navigate([], [], []);
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 md:px-[60px] md:py-[34px]">
      <div className="relative">
        <div className="flex flex-wrap items-center gap-[9px]">
          <p className="mr-[4px] font-asap text-[14px] uppercase leading-none text-voicesNext-cream">
            FILTERS:
          </p>
          <button
            type="button"
            className={cn(
              "inline-flex h-[22px] items-center justify-center gap-2 rounded-full border border-voicesNext-cream px-4 font-asap text-[12px] font-bold uppercase leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
              genres.length
                ? "bg-voicesNext-cream text-voicesNext-background"
                : "text-voicesNext-cream hover:bg-voicesNext-cream hover:text-voicesNext-background",
            )}
            aria-expanded={genresOpen}
            aria-controls="explore-genre-list"
            disabled={isPending}
            onClick={() => setGenresOpen((open) => !open)}
          >
            GENRES
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3 shrink-0 transition-transform",
                genresOpen && "rotate-180",
              )}
            />
          </button>

          {stationOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={stations.includes(option.value)}
              disabled={isPending}
              onClick={() =>
                updateStations(toggleValue(stations, option.value))
              }
            >
              {option.label}
            </FilterPill>
          ))}

          {locationOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={locations.includes(option.value)}
              disabled={isPending}
              onClick={() =>
                updateLocations(toggleValue(locations, option.value))
              }
            >
              {option.label}
            </FilterPill>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              disabled={isPending}
              onClick={clearFilters}
              className="font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-secondary transition-colors hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            >
              Clear
            </button>
          )}
        </div>

        {genresOpen && (
          <div
            id="explore-genre-list"
            className="mt-[27px] flex w-full max-w-[560px] flex-col items-start gap-[22px] md:ml-[174px] md:mt-[33px]"
          >
            {exploreGenreOptions.map((genre) => {
              const active = genres.includes(genre);
              const subgenres = Object.keys(exploreGenreTaxonomy[genre]);
              const hasActiveSubgenre = genres.some((value) =>
                value.startsWith(`${genre} > `),
              );
              const isExpanded = expandedGenre === genre;

              return (
                <div key={genre} className="w-full">
                  <div
                    className={cn(
                      "inline-flex min-h-[35px] w-auto max-w-full items-center rounded-full border-2 border-voicesNext-cream text-left font-asap text-[18px] font-bold leading-none text-voicesNext-cream transition-colors",
                      active || hasActiveSubgenre
                        ? "border-voicesNext-orange text-voicesNext-orange"
                        : "hover:border-voicesNext-orange hover:text-voicesNext-orange",
                    )}
                  >
                    <button
                      type="button"
                      disabled={isPending}
                      className="min-w-0 truncate py-[6px] pl-[13px] pr-[15px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange"
                      aria-pressed={active}
                      onClick={() =>
                        updateGenres(toggleGenre(genres, genre))
                      }
                    >
                      {genre}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      className={cn(
                        "mr-[3px] inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current focus:outline-none focus:ring-2 focus:ring-voicesNext-orange",
                        active &&
                          "bg-voicesNext-orange text-voicesNext-background",
                      )}
                      aria-label={`Toggle ${genre} subgenres`}
                      aria-expanded={isExpanded}
                      aria-controls={`explore-subgenres-${getGenreControlId(genre)}`}
                      onClick={() =>
                        setExpandedGenre((current) =>
                          current === genre ? null : genre,
                        )
                      }
                    >
                      <ChevronDown
                        className={cn(
                          "size-[15px] stroke-[4px]",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                  {isExpanded && (
                    <div
                      id={`explore-subgenres-${getGenreControlId(genre)}`}
                      className="mt-3 flex flex-wrap gap-2 pl-4"
                    >
                      {subgenres.map((subgenre) => {
                        const key = getGenreKey(genre, subgenre);
                        const subgenreActive = genres.includes(key);

                        return (
                          <FilterPill
                            key={key}
                            active={active || subgenreActive}
                            disabled={isPending}
                            onClick={() =>
                              updateGenres(
                                toggleGenre(genres, genre, subgenre),
                              )
                            }
                          >
                            {subgenre}
                          </FilterPill>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
