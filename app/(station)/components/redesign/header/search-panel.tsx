import Link from "next/link";
import { searchSections, type SearchCategories } from "./search-model";

export type SearchPanelProps = {
  query: string;
  ready: boolean;
  loading: boolean;
  error: string | null;
  results: SearchCategories | null;
  hasResults: boolean;
  /** Called when a result is chosen, so each surface can close what it opened. */
  onNavigate: () => void;
};

/**
 * The search results list, shared by the desktop dropdown and the mobile menu.
 * Extracted when search reached mobile — the panel is 80 lines of markup and
 * two copies would have drifted the way the old nav/menu pair did.
 */
export function SearchPanel({
  query,
  ready,
  loading,
  error,
  results,
  hasResults,
  onNavigate,
}: SearchPanelProps) {
  return (
    <>
      <div className="border-b border-voicesNext-border px-4 py-3">
        <p className="font-asap text-[11px] font-bold uppercase tracking-[1px] text-voicesNext-secondary">
          Search
        </p>
        <p className="mt-1 truncate font-gabarito text-sm font-bold text-voicesNext-cream">
          {query}
        </p>
      </div>

      {!ready && (
        <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
          Type at least 2 characters.
        </p>
      )}

      {ready && loading && !results && (
        <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
          Searching…
        </p>
      )}

      {ready && error && (
        <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
          {error}
        </p>
      )}

      {ready && results && !loading && !error && !hasResults && (
        <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
          No results found.
        </p>
      )}

      {ready && hasResults && (
        <div className="divide-y divide-voicesNext-border">
          {searchSections.map((section) => {
            const items = results?.[section.key] ?? [];

            if (!items.length) return null;

            return (
              <section
                key={section.key}
                className="px-2 py-3"
                aria-labelledby={`site-search-${section.key}`}
              >
                <h2
                  id={`site-search-${section.key}`}
                  className="px-2 pb-2 font-asap text-[11px] font-bold uppercase tracking-[1px] text-voicesNext-orange"
                >
                  {section.label}
                </h2>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={`${section.key}-${item.id}`}>
                      <Link
                        href={item.url}
                        className="block px-2 py-2 transition-colors hover:bg-voicesNext-surface focus:outline-none focus-visible:bg-voicesNext-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange"
                        onClick={onNavigate}
                      >
                        <span className="block truncate font-gabarito text-sm font-bold text-voicesNext-cream">
                          {item.title}
                        </span>
                        <span className="mt-1 line-clamp-2 block font-asap text-xs leading-snug text-voicesNext-secondary">
                          {[item.subtitle, item.description]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
