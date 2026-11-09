import { X } from "lucide-react";
import Link from "next/link";
import { buildGenreHref, removeGenre } from "@/lib/voices/genre-filter";

/**
 * Row of removable tag chips for the active genre filters. Each chip's "×" is
 * a link back to the same route with that one genre dropped, so removal
 * re-filters on the rest. "Clear all" drops every genre. Renders nothing when
 * no genres are selected.
 */
export default function GenreFilterChips({
  genres,
  basePath,
  extraParams,
}: {
  genres: string[];
  basePath: string;
  extraParams?: Record<string, string | undefined>;
}) {
  if (!genres.length) return null;

  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-2 md:mb-[30px]"
      role="region"
      aria-label="Active genre filters"
    >
      <ul className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <li key={genre}>
            <span className="inline-flex min-h-[35px] items-center gap-1 rounded-full bg-voicesNext-cream py-[6px] pl-[13px] pr-[6px] font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-background">
              {genre}
              <Link
                href={buildGenreHref(
                  basePath,
                  removeGenre(genres, genre),
                  extraParams,
                )}
                aria-label={`Remove ${genre} filter`}
                className="inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-cream"
              >
                <X aria-hidden="true" className="size-[13px] stroke-[4px]" />
              </Link>
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={buildGenreHref(basePath, [], extraParams)}
        className="ml-1 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-secondary underline-offset-4 transition-colors hover:text-voicesNext-cream hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
      >
        Clear all
      </Link>
    </div>
  );
}
