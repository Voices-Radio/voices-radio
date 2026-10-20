"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

/**
 * Name search for the artists listing. The query lives in `?q=` so results are
 * shareable and the server page does the filtering; this only writes the URL.
 * Other params (genre, tab) are kept; `expand` is dropped so a new search
 * starts collapsed.
 */
export default function ArtistSearchField() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Follow the URL when it changes elsewhere (back button, "clear search" link).
  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  function navigate(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("expand");
    if (next) params.set("q", next);
    else params.delete("q");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function handleChange(next: string) {
    setValue(next);
    window.clearTimeout(timeoutRef.current);

    const trimmed = next.trim();
    if (trimmed && trimmed.length < MIN_QUERY_LENGTH) return;
    if (trimmed === urlQuery) return;

    timeoutRef.current = window.setTimeout(
      () => navigate(trimmed),
      DEBOUNCE_MS,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.clearTimeout(timeoutRef.current);
    navigate(value.trim());
  }

  function handleClear() {
    window.clearTimeout(timeoutRef.current);
    setValue("");
    navigate("");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1280px] px-4 md:px-[70px]"
    >
      <div className="relative max-w-[480px]">
        <label htmlFor="artist-search" className="sr-only">
          Search artists
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-voicesNext-secondary"
        />
        <input
          id="artist-search"
          type="search"
          name="q"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Search artists"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-voicesNext-cream bg-transparent pl-11 pr-11 font-asap text-[16px] text-voicesNext-cream placeholder:text-voicesNext-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-voicesNext-cream transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
          >
            <X aria-hidden="true" className="size-4 stroke-[3px]" />
          </button>
        )}
      </div>
    </form>
  );
}
