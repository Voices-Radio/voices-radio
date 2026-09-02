"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { accountLinksForCapabilities } from "@/lib/voices/membership/capabilities";
import AccountMenu, { getInitials } from "./account-menu";
import BrandMark from "./brand-mark";
import { useSessionUser } from "./use-session-user";

const SHOP_FALLBACK_URL = "https://shop.voicesradio.co.uk/";

type HeaderSettings = {
  contactLink?: string;
  storeLink?: string;
  instagramLink?: string;
  mixcloudLink?: string;
};

type SearchResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  subtitle?: string;
  station?: string;
  tags?: string[];
};

type SearchCategories = {
  shows: SearchResult[];
  artists: SearchResult[];
  mainBlog: SearchResult[];
  podcastBlog: SearchResult[];
};

type SearchResponse = {
  categories?: Partial<SearchCategories>;
  message?: string;
};

type SearchSection = {
  key: keyof SearchCategories;
  label: string;
};

const searchSections: SearchSection[] = [
  { key: "shows", label: "Shows" },
  { key: "artists", label: "Artists" },
  { key: "mainBlog", label: "Main blog" },
  { key: "podcastBlog", label: "Podcast blog" },
];

const desktopMenuLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcast Studio", opensInNewTab: true },
  { href: "/agency", label: "Agency", opensInNewTab: true },
  { href: "/collaborate", label: "Partner with Us" },
  { href: "/about", label: "About Us" },
  { href: "/support", label: "Why support us" },
];

const collaborateLinks = [
  { href: "/podcast", label: "Podcast Studio", opensInNewTab: true },
  { href: "/agency", label: "Agency", opensInNewTab: true },
  { href: "/collaborate", label: "Partner with Us" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getFirstSearchResult(categories: SearchCategories | null) {
  for (const section of searchSections) {
    const result = categories?.[section.key]?.[0];
    if (result) return result;
  }

  return null;
}

function hasSearchResults(categories: SearchCategories | null) {
  return searchSections.some((section) =>
    Boolean(categories?.[section.key]?.length),
  );
}

function WavyMenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[21px] w-[29px]"
      fill="none"
      viewBox="0 0 29 21"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 4.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1M1.5 10.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1M1.5 16.5c3.2-2.5 6.4-2.5 9.6 0 3.2 2.4 6.4 2.4 9.6 0 2.5-1.9 4.8-2.3 6.8-1.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

function MobileHeaderArtwork() {
  return (
    <>
      <Link
        href="/"
        className="block h-[37px] w-[37px] justify-self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        <Image
          src="/VOICESLOGO_LIGHTBOX.png"
          alt=""
          width={37}
          height={37}
          className="h-[37px] w-[37px] object-contain"
          priority
        />
      </Link>
      <Link
        href="/"
        className="block h-[28px] w-[82px] justify-self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        <Image
          src="/voices-wordmark.svg"
          alt=""
          width={82}
          height={28}
          className="h-[28px] w-[82px] object-contain"
          priority
        />
      </Link>
    </>
  );
}

function MobileOnAirTicker() {
  return (
    <div className="h-[15px] overflow-hidden bg-voicesNext-background font-outfit text-[9px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-secondary md:hidden">
      <div className="flex h-full w-max items-center gap-[6px] px-1">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} className="flex shrink-0 items-center gap-[6px]">
            <span>On air</span>
            <span className="size-2 rounded-full bg-voicesNext-live" />
          </span>
        ))}
      </div>
    </div>
  );
}

function CollaborateDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = collaborateLinks.some((link) => isActive(pathname, link.href));

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="voices-nav-link inline-flex items-center gap-1 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background lg:text-[21px]"
        data-active={active}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="collaborate-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Collaborate
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform", open && "rotate-180")}
          strokeWidth={3}
        />
      </button>

      {open && (
        <div
          id="collaborate-menu"
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-5 w-[220px] -translate-x-1/2 border border-voicesNext-border bg-voicesNext-background p-2 shadow-2xl"
        >
          {collaborateLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.opensInNewTab ? "_blank" : undefined}
              rel={link.opensInNewTab ? "noopener noreferrer" : undefined}
              role="menuitem"
              className={cn(
                "block px-3 py-3 font-gabarito text-[16px] font-bold leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-surface hover:text-voicesNext-orange focus:outline-none focus-visible:bg-voicesNext-surface focus-visible:text-voicesNext-orange focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voicesNext-orange",
                isActive(pathname, link.href) && "text-voicesNext-orangeText",
              )}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile counterpart to <AccountMenu /> — the desktop avatar/Sign in cluster
 * lives in a `hidden md:flex` row, so without this, members on phones would
 * have no route to /account at all. Sits above the existing "Become a
 * Supporter" CTA in the mobile menu.
 */
function MobileAccountLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const { user, status, signOut } = useSessionUser();
  const [signingOut, setSigningOut] = useState(false);

  // Returning null here used to let the menu open a row short and then grow
  // one once the session resolved, moving links out from under a thumb that
  // was already reaching. Reserve the height instead.
  if (status === "loading") {
    return (
      <div className="mt-6 px-6" aria-hidden="true">
        <div className="h-5 w-24 animate-pulse bg-voicesNext-surface" />
      </div>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      onNavigate();
      router.push("/");
      router.refresh();
    }
  }

  if (!user) {
    return (
      <div className="mt-6 px-6">
        <Link
          href="/sign-in"
          onClick={onNavigate}
          className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initials = getInitials(user);
  const accountLinks = accountLinksForCapabilities(user.capabilities);

  return (
    <div className="mt-6 flex flex-col gap-[25px] px-6">
      {accountLinks.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="flex items-center gap-3 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
        >
          {index === 0 && (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-voicesNext-border bg-voicesNext-surface font-gabarito text-xs font-bold uppercase"
            >
              {initials}
            </span>
          )}
          {index === 0 ? "My account" : link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="text-left font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream/70 transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

type SearchPanelProps = {
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
function SearchPanel({
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

export default function SiteHeader({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCategories | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const shopLink = settings.storeLink || SHOP_FALLBACK_URL;
  // Always the membership signup page. settings.applyLink is the CMS
  // "Apply Link" field (VOICES_APPLY_FOR_SHOW_URL, the radio show
  // submission Google Form) — it's a required field so it's always
  // populated, meaning a `settings.applyLink || "/join"` fallback here
  // would never actually fall back and "Become a Supporter" would always
  // open the show-submission form instead of the join page.
  const supporterLink = "/join";
  const contactLink = settings.contactLink || "/chat";
  const trimmedSearchQuery = searchQuery.trim();
  const searchReady = trimmedSearchQuery.length >= 2;
  const searchHasResults = hasSearchResults(searchResults);
  // Desktop reveals the field behind a toggle; the mobile menu shows it
  // outright. Either counts as "the visitor is searching", so the fetch below
  // has to watch both rather than just the desktop toggle.
  const searchActive = searchOpen || open;
  const searchButtonLabel = searchOpen
    ? trimmedSearchQuery
      ? "Submit search"
      : "Close search"
    : "Open search";

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setSearchResults(null);
    setSearchError(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  // Escape-to-close, focus trap, and focus restore to whichever hamburger
  // button opened the menu are handled by Dialog.Content below — no manual
  // keydown listener needed here.

  useEffect(() => {
    if (!searchOpen) return;

    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchActive || !searchReady) {
      setSearchResults(null);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);

      try {
        const params = new URLSearchParams({
          q: trimmedSearchQuery,
          limit: "5",
        });
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response
          .json()
          .catch(() => null)) as SearchResponse | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Search failed.");
        }

        setSearchResults({
          shows: payload?.categories?.shows ?? [],
          artists: payload?.categories?.artists ?? [],
          mainBlog: payload?.categories?.mainBlog ?? [],
          podcastBlog: payload?.categories?.podcastBlog ?? [],
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        setSearchResults(null);
        setSearchError(
          error instanceof Error ? error.message : "Search failed.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchActive, searchReady, trimmedSearchQuery]);

  function submitSearch() {
    if (!trimmedSearchQuery) {
      setSearchOpen(false);
      return;
    }

    const firstResult = getFirstSearchResult(searchResults);

    if (firstResult?.url) {
      setSearchOpen(false);
      router.push(firstResult.url);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  function handleMobileSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstResult = getFirstSearchResult(searchResults);
    if (!firstResult?.url) return;

    setOpen(false);
    router.push(firstResult.url);
  }

  function handleSearchButtonClick() {
    if (!searchOpen) {
      setSearchOpen(true);
      return;
    }

    submitSearch();
  }

  return (
    <header className="sticky top-0 z-40 -mx-2 bg-voicesNext-safeArea md:mx-0 md:bg-voicesNext-background">
      {/*
        Solid colour behind the Dynamic Island / status bar. Kept as its own
        box rather than folded into the gradient below: stretching that
        gradient across the safe-area inset (~59px on Dynamic Island phones)
        diluted #4b4b4b down to near-black by the time it reached the visible
        island area. `env(safe-area-inset-top)` collapses to 0 outside iOS
        Safari, so this is a no-op there.
      */}
      <div
        aria-hidden="true"
        className="h-[env(safe-area-inset-top,0px)] bg-voicesNext-safeArea md:hidden"
      />
      <div className="grid min-h-[50px] grid-cols-[1fr_auto_1fr] items-center bg-gradient-to-b from-voicesNext-safeArea via-[#343434] to-voicesNext-background px-[17px] pb-[4px] pt-[4px] md:hidden">
        <MobileHeaderArtwork />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
          onClick={() => {
            setSearchOpen(false);
            setOpen(true);
          }}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="site-navigation-menu"
        >
          <WavyMenuIcon />
        </button>
      </div>
      <MobileOnAirTicker />

      <div className="hidden h-[54px] w-full items-center justify-between md:flex md:h-[72px] md:px-3">
        <BrandMark />

        <nav
          className="ml-auto hidden items-center gap-6 md:flex lg:gap-7 xl:gap-8"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background lg:text-[21px]"
            data-active={isActive(pathname, "/")}
            aria-current={isActive(pathname, "/") ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={cn(
              "voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background lg:text-[21px]",
            )}
            data-active={isActive(pathname, "/explore")}
            aria-current={isActive(pathname, "/explore") ? "page" : undefined}
          >
            Explore
          </Link>
          <a
            href={shopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background lg:text-[21px]"
          >
            Shop
          </a>
          <CollaborateDropdown pathname={pathname} />
        </nav>

        <div className="ml-3 flex h-[54px] items-center gap-2 md:ml-3 md:h-[72px] lg:ml-4 lg:gap-3">
          <div ref={searchContainerRef} className="relative">
            <form
              className="flex items-center justify-end"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <label htmlFor="site-search" className="sr-only">
                Search all content
              </label>
              <input
                id="site-search"
                ref={searchInputRef}
                type="search"
                name="site-search"
                autoComplete="off"
                spellCheck={false}
                value={searchQuery}
                tabIndex={searchOpen ? 0 : -1}
                aria-hidden={!searchOpen}
                aria-autocomplete="list"
                aria-controls="site-search-results"
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search shows, artists…"
                className={cn(
                  "h-9 min-w-0 border border-voicesNext-border bg-voicesNext-background px-3 font-gabarito text-sm font-bold text-voicesNext-cream outline-none transition-[width,margin-right,padding-left,padding-right,border-color,opacity] duration-200 placeholder:text-voicesNext-secondary focus-visible:border-voicesNext-orange focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-10",
                  searchOpen
                    ? "mr-2 w-[52vw] max-w-[260px] opacity-100 md:w-[220px] lg:w-[280px]"
                    : "pointer-events-none mr-0 w-0 border-transparent px-0 opacity-0",
                )}
              />
              <button
                type="button"
                className="inline-flex h-[54px] w-10 shrink-0 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[72px] md:w-11"
                onClick={handleSearchButtonClick}
                aria-label={searchButtonLabel}
                aria-expanded={searchOpen}
                aria-controls="site-search"
              >
                <Search aria-hidden="true" size={22} strokeWidth={3.2} />
              </button>
            </form>

            {searchOpen && trimmedSearchQuery && (
              <div
                id="site-search-results"
                className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-[calc(100vw-1rem)] max-w-[440px] overflow-y-auto border border-voicesNext-border bg-voicesNext-background shadow-2xl md:w-[440px]"
                role="region"
                aria-live="polite"
              >
                <SearchPanel
                  query={trimmedSearchQuery}
                  ready={searchReady}
                  loading={searchLoading}
                  error={searchError}
                  results={searchResults}
                  hasResults={searchHasResults}
                  onNavigate={() => setSearchOpen(false)}
                />
              </div>
            )}
          </div>
          <AccountMenu />
          <button
            type="button"
            className="inline-flex h-[54px] w-10 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background md:h-[72px] md:w-11"
            onClick={() => {
              setSearchOpen(false);
              setOpen(true);
            }}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-navigation-menu"
          >
            <WavyMenuIcon />
          </button>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Content
            id="site-navigation-menu"
            className="min-h-dvh fixed inset-0 z-50 overscroll-contain bg-voicesNext-background text-voicesNext-cream focus:outline-none"
            aria-label="Navigation menu"
            aria-describedby={undefined}
          >
            <div className="min-h-dvh flex flex-col md:hidden">
              <div className="grid min-h-[calc(48px+env(safe-area-inset-top))] grid-cols-[1fr_auto_1fr] items-center px-[14px] pb-[4px] pt-[calc(4px+env(safe-area-inset-top))]">
                <MobileHeaderArtwork />
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center justify-self-end font-gabarito text-[36px] font-medium leading-none text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X aria-hidden="true" size={26} strokeWidth={3} />
                </button>
              </div>

              {/*
                Search reached mobile here. It had lived only inside the
                `hidden md:flex` header row, so phones — where browsing a
                catalogue is hardest and search matters most — had no entry
                point at all, despite /api/search already indexing shows,
                artists and both blogs. Shares its state and its result panel
                with the desktop dropdown.
              */}
              <div className="mt-9 px-6">
                <form role="search" onSubmit={handleMobileSearchSubmit}>
                  <label htmlFor="mobile-site-search" className="sr-only">
                    Search all content
                  </label>
                  <div className="flex items-center gap-3 border-b border-voicesNext-border pb-2 focus-within:border-voicesNext-orange">
                    <Search
                      aria-hidden="true"
                      size={20}
                      strokeWidth={3}
                      className="shrink-0 text-voicesNext-secondary"
                    />
                    <input
                      id="mobile-site-search"
                      type="search"
                      name="mobile-site-search"
                      autoComplete="off"
                      spellCheck={false}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search shows, artists…"
                      aria-autocomplete="list"
                      aria-controls="mobile-search-results"
                      className="h-11 min-w-0 flex-1 bg-transparent font-gabarito text-base font-bold text-voicesNext-cream outline-none placeholder:font-normal placeholder:text-voicesNext-secondary"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-voicesNext-secondary transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
                      >
                        <X aria-hidden="true" size={18} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </form>

                {trimmedSearchQuery && (
                  <div
                    id="mobile-search-results"
                    role="region"
                    aria-live="polite"
                    className="mt-3 max-h-[45vh] overflow-y-auto border border-voicesNext-border bg-voicesNext-background"
                  >
                    <SearchPanel
                      query={trimmedSearchQuery}
                      ready={searchReady}
                      loading={searchLoading}
                      error={searchError}
                      results={searchResults}
                      hasResults={searchHasResults}
                      onNavigate={() => {
                        setSearchOpen(false);
                        setOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <nav
                className="mt-9 flex flex-col gap-[25px] px-6"
                aria-label="Menu"
              >
                <Link
                  href="/"
                  className={cn(
                    "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                    isActive(pathname, "/")
                      ? "text-voicesNext-orange"
                      : "text-voicesNext-cream",
                  )}
                  aria-current={isActive(pathname, "/") ? "page" : undefined}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={cn(
                    "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                    isActive(pathname, "/explore") ||
                      isActive(pathname, "/artists")
                      ? "text-voicesNext-orange"
                      : "text-voicesNext-cream",
                  )}
                  aria-current={
                    isActive(pathname, "/explore") ? "page" : undefined
                  }
                >
                  Explore
                </Link>
                <a
                  href={shopLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                >
                  Shop
                </a>
                <div className="flex flex-col gap-3">
                  <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[1px] text-voicesNext-secondary">
                    Collaborate
                  </p>
                  {collaborateLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.opensInNewTab ? "_blank" : undefined}
                      rel={
                        link.opensInNewTab ? "noopener noreferrer" : undefined
                      }
                      onClick={() => setOpen(false)}
                      className={cn(
                        "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                        isActive(pathname, link.href)
                          ? "text-voicesNext-orange"
                          : "text-voicesNext-cream",
                      )}
                      aria-current={
                        isActive(pathname, link.href) ? "page" : undefined
                      }
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/about"
                  className={cn(
                    "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                    isActive(pathname, "/about")
                      ? "text-voicesNext-orange"
                      : "text-voicesNext-cream",
                  )}
                >
                  About Us
                </Link>
                <Link
                  href="/support"
                  className={cn(
                    "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                    isActive(pathname, "/support")
                      ? "text-voicesNext-orange"
                      : "text-voicesNext-cream",
                  )}
                >
                  Why support us
                </Link>
                <a
                  href={contactLink}
                  className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                >
                  Contact
                </a>
              </nav>

              <MobileAccountLinks
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />

              <div className="mt-auto">
                <div className="px-[23px] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
                  <a
                    href={supporterLink}
                    className="inline-flex h-14 w-full items-center justify-center rounded-full bg-voicesNext-orange px-6 font-gabarito text-[20px] font-medium text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  >
                    Join Voices
                  </a>
                </div>
              </div>
            </div>

            <div className="min-h-dvh hidden px-2 py-0 md:block md:px-3">
              <div className="flex items-center justify-between">
                <BrandMark />
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X aria-hidden="true" size={24} />
                </button>
              </div>

              <nav className="mt-12 flex flex-col gap-7" aria-label="Menu">
                {desktopMenuLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.opensInNewTab ? "_blank" : undefined}
                    rel={link.opensInNewTab ? "noopener noreferrer" : undefined}
                    className={cn(
                      "font-gabarito text-3xl font-bold text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
                      isActive(pathname, link.href) && "text-voicesNext-orange",
                    )}
                    aria-current={
                      isActive(pathname, link.href) ? "page" : undefined
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-16 flex flex-wrap gap-4 font-gabarito text-sm font-bold uppercase text-voicesNext-secondary">
                {settings.contactLink && (
                  <a
                    href={settings.contactLink}
                    className="transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  >
                    Contact
                  </a>
                )}
                {settings.instagramLink && (
                  <a
                    href={settings.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  >
                    Instagram
                  </a>
                )}
                {settings.mixcloudLink && (
                  <a
                    href={settings.mixcloudLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                  >
                    Mixcloud
                  </a>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
