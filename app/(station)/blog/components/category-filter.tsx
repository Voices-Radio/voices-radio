import { X } from "lucide-react";
import Link from "next/link";
import { formatCategoryLabel } from "@/lib/voices/blog";
import { buildFilterHref, toggleValue } from "@/lib/voices/param-filter";

const BASE_PATH = "/blog";
const PARAM = "category";

/**
 * Category chips for the blog index.
 *
 * Categories used to be six pastel badges that did nothing — decoration
 * dressed as a control. These are the same URL-param filter chips /explore
 * and /artists already use for genres, down to the "×" and "Clear all", so
 * filtering behaves identically wherever you meet it on the site. Selection
 * lives in `?category=`, which keeps a filtered index linkable and shareable.
 */
export default function CategoryFilter({
  categories,
  selected,
}: {
  categories: string[];
  selected: string[];
}) {
  if (!categories.length) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="region"
      aria-label="Filter posts by category"
    >
      {categories.map((category) => {
        const active = selected.includes(category);
        const href = buildFilterHref(
          BASE_PATH,
          PARAM,
          toggleValue(selected, category),
        );

        return active ? (
          <span
            key={category}
            className="inline-flex min-h-[35px] items-center gap-1 rounded-full bg-voicesNext-cream py-[6px] pl-[13px] pr-[6px] font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-background"
          >
            {formatCategoryLabel(category)}
            <Link
              href={href}
              aria-label={`Remove ${formatCategoryLabel(category)} filter`}
              className="inline-flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border-2 border-current text-voicesNext-background transition-colors hover:bg-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-cream"
            >
              <X aria-hidden="true" className="h-[13px] w-[13px] stroke-[4px]" />
            </Link>
          </span>
        ) : (
          <Link
            key={category}
            href={href}
            className="inline-flex min-h-[35px] items-center rounded-full border border-voicesNext-border px-[13px] font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-secondary transition-colors hover:border-voicesNext-orange hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          >
            {formatCategoryLabel(category)}
          </Link>
        );
      })}

      {selected.length > 0 && (
        <Link
          href={BASE_PATH}
          className="ml-1 font-asap text-[12px] font-bold uppercase leading-none text-voicesNext-secondary underline-offset-4 transition-colors hover:text-voicesNext-cream hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}
