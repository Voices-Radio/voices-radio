import { ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  genrePrimaryOptions,
  genreTaxonomy,
  getGenreKey,
} from "@/lib/voices/genre-taxonomy";

/**
 * Full-page genre browser: one expandable pill per primary genre, revealing
 * its subgenres as links. Shared by /explore and /artists so both surfaces
 * offer the same filtering system.
 */
export default function GenreBrowser({
  buildHref,
}: {
  buildHref: (genreKey: string) => string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-[70px] md:pb-[96px]">
      <div className="max-w-[760px] space-y-3 md:space-y-4">
        {genrePrimaryOptions.map((genre) => (
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
                href={buildHref(genre)}
                className="inline-flex min-h-[31px] items-center justify-center rounded-full border border-voicesNext-orange bg-voicesNext-cream px-[10px] py-1 font-asap text-[16px] font-bold uppercase leading-none text-voicesNext-orange transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[22px] md:min-h-0 md:px-4 md:py-0 md:text-[12px]"
              >
                All
              </Link>
              {Object.keys(genreTaxonomy[genre] ?? {}).map((subgenre) => {
                const key = getGenreKey(genre, subgenre);

                return (
                  <Link
                    key={key}
                    href={buildHref(key)}
                    className="inline-flex min-h-[31px] items-center justify-center rounded-full border border-voicesNext-cream px-[10px] py-1 font-asap text-[16px] font-bold uppercase leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[22px] md:min-h-0 md:px-4 md:py-0 md:text-[12px]"
                  >
                    {subgenre}
                  </Link>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
