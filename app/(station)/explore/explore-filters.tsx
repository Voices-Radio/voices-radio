"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { exploreGenreOptions } from "./explore-options";

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

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
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
      onClick={onClick}
    >
      {children}
    </button>
  );
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
  const [genresOpen, setGenresOpen] = useState(selectedGenres.length > 0);
  const [genres, setGenres] = useState(selectedGenres);
  const [stations, setStations] = useState(selectedStations);
  const [locations, setLocations] = useState(selectedLocations);
  const hasActiveFilters =
    genres.length > 0 || stations.length > 0 || locations.length > 0;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8 md:px-[60px] md:py-[34px]">
      <form action="/explore" className="relative">
        {genres.map((genre) => (
          <input key={genre} type="hidden" name="genre" value={genre} />
        ))}
        {stations.map((station) => (
          <input key={station} type="hidden" name="station" value={station} />
        ))}
        {locations.map((location) => (
          <input key={location} type="hidden" name="location" value={location} />
        ))}

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
              onClick={() =>
                setStations((current) => toggleValue(current, option.value))
              }
            >
              {option.label}
            </FilterPill>
          ))}

          {locationOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={locations.includes(option.value)}
              onClick={() =>
                setLocations((current) => toggleValue(current, option.value))
              }
            >
              {option.label}
            </FilterPill>
          ))}

          <button
            type="submit"
            className="ml-0 inline-flex h-[24px] items-center justify-center rounded-full bg-voicesNext-orange px-4 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:ml-[22px]"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <Link
              href="/explore"
              className="font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-secondary transition-colors hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
            >
              Clear
            </Link>
          )}
        </div>

        {genresOpen && (
          <div
            id="explore-genre-list"
            className="mt-[27px] flex w-full max-w-[560px] flex-col items-start gap-[22px] md:ml-[174px] md:mt-[33px]"
          >
            {exploreGenreOptions.map((genre) => {
              const active = genres.includes(genre);

              return (
                <button
                  key={genre}
                  type="button"
                  className={cn(
                    "inline-flex min-h-[35px] w-auto max-w-full items-center gap-[15px] rounded-full border-2 border-voicesNext-cream py-[4px] pl-[13px] pr-[5px] text-left font-asap text-[18px] font-bold leading-none text-voicesNext-cream transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
                    active
                      ? "border-voicesNext-orange text-voicesNext-orange"
                      : "hover:border-voicesNext-orange hover:text-voicesNext-orange",
                  )}
                  aria-pressed={active}
                  onClick={() =>
                    setGenres((current) => toggleValue(current, genre))
                  }
                >
                  <span className="min-w-0 truncate">{genre}</span>
                  <span
                    className={cn(
                      "inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current",
                      active && "bg-voicesNext-orange text-voicesNext-background",
                    )}
                    aria-hidden="true"
                  >
                    <ChevronDown
                      className={cn(
                        "size-[15px] stroke-[4px]",
                        active && "rotate-180",
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </form>
    </section>
  );
}
