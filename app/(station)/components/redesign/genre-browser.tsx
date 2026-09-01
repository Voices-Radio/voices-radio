import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  genrePrimaryOptions,
  genreTaxonomy,
  getGenreKey,
} from "@/lib/voices/genre-taxonomy";

/**
 * Genre browser: one expandable pill per primary genre, revealing its
 * subgenres as links. Shared by /explore and /artists so both surfaces offer
 * the same filtering system. The caller owns the surrounding layout / padding.
 *
 * Selection is multi-select: `buildToggleHref` returns a URL that adds the
 * genre if unselected or removes it if already selected. Selected pills carry
 * a check mark so the state is not conveyed by colour alone.
 */
export default function GenreBrowser({
  selectedGenres,
  buildToggleHref,
}: {
  selectedGenres: string[];
  buildToggleHref: (genreKey: string) => string;
}) {
  const selected = new Set(selectedGenres);

  return (
    <div className="max-w-[760px] space-y-3 md:space-y-4">
      {genrePrimaryOptions.map((genre) => {
        const subgenreKeys = Object.keys(genreTaxonomy[genre] ?? {}).map(
          (subgenre) => ({ subgenre, key: getGenreKey(genre, subgenre) }),
        );
        const selectedCount =
          (selected.has(genre) ? 1 : 0) +
          subgenreKeys.filter(({ key }) => selected.has(key)).length;

        return (
          <details
            key={genre}
            className="group w-full"
            open={selectedCount > 0}
          >
            <summary className="inline-flex min-h-[35px] w-auto max-w-full cursor-pointer list-none items-center rounded-full border-2 border-voicesNext-cream text-left font-asap text-[18px] font-bold leading-none text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 truncate py-[6px] pl-[13px] pr-[15px]">
                {genre}
              </span>
              {selectedCount > 0 && (
                <span className="mr-[6px] inline-flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-voicesNext-orange px-1 font-asap text-[12px] font-bold leading-none text-voicesNext-cream">
                  {selectedCount}
                </span>
              )}
              <span
                aria-hidden="true"
                className="mr-[3px] inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current"
              >
                <ChevronDown className="size-[15px] stroke-[4px] transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-2 pl-4">
              <GenrePill
                href={buildToggleHref(genre)}
                label="All"
                selected={selected.has(genre)}
                emphasis
              />
              {subgenreKeys.map(({ subgenre, key }) => (
                <GenrePill
                  key={key}
                  href={buildToggleHref(key)}
                  label={subgenre}
                  selected={selected.has(key)}
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function GenrePill({
  href,
  label,
  selected,
  emphasis = false,
}: {
  href: string;
  label: string;
  selected: boolean;
  emphasis?: boolean;
}) {
  const base =
    "inline-flex min-h-[31px] items-center justify-center gap-1 rounded-full border px-[10px] py-1 font-asap text-[16px] font-bold uppercase leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[22px] md:min-h-0 md:px-4 md:py-0 md:text-[12px]";

  const idle = emphasis
    ? "border-voicesNext-orange bg-voicesNext-cream text-voicesNext-orange hover:bg-voicesNext-orange hover:text-voicesNext-cream"
    : "border-voicesNext-cream text-voicesNext-cream hover:bg-voicesNext-cream hover:text-voicesNext-background";

  const active =
    "border-voicesNext-orange bg-voicesNext-orange text-voicesNext-cream hover:bg-voicesNext-cream hover:text-voicesNext-orange";

  return (
    <Link
      href={href}
      aria-label={`${label}, ${selected ? "selected" : "not selected"}`}
      className={`${base} ${selected ? active : idle}`}
    >
      {selected && (
        <Check
          aria-hidden="true"
          className="size-[13px] shrink-0 stroke-[4px]"
        />
      )}
      {label}
    </Link>
  );
}
