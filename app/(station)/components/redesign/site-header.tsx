"use client";

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
  applyLink?: string;
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
  { href: "/podcast", label: "Podcast Studio" },
  { href: "/agency", label: "Agency" },
  { href: "/collaborate", label: "Partner with Us" },
  { href: "/support", label: "Support Us" },
];

const collaborateLinks = [
  { href: "/podcast", label: "Podcast Studio" },
  { href: "/agency", label: "Agency" },
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
        className="relative block h-[45px] w-[57px] justify-self-start focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        <Image
          src="/voices.svg"
          alt=""
          fill
          sizes="57px"
          className="object-contain [filter:brightness(0)_saturate(100%)_invert(40%)_sepia(91%)_saturate(1164%)_hue-rotate(345deg)_brightness(91%)_contrast(91%)]"
          priority
        />
      </Link>
      <Link
        href="/"
        className="relative block h-[35px] w-[102px] justify-self-center focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
        aria-label="Voices Radio home"
      >
        <Image
          src="/voices-wordmark.svg"
          alt=""
          fill
          sizes="102px"
          className="object-contain"
          priority
        />
      </Link>
    </>
  );
}

function MobileOnAirTicker() {
  return (
    <div className="h-[19px] overflow-hidden bg-voicesNext-background font-outfit text-[10px] font-bold uppercase leading-none tracking-[2px] text-voicesNext-secondary md:hidden">
      <div className="voices-on-air-marquee flex h-full w-max items-center gap-[6px] px-1">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={index} className="flex shrink-0 items-center gap-[6px]">
            <span>{index < 12 ? "On air" : "Live now"}</span>
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
        className="voices-nav-link inline-flex items-center gap-1 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]"
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
              role="menuitem"
              className={cn(
                "block px-3 py-3 font-gabarito text-[16px] font-bold leading-none text-voicesNext-cream transition-colors hover:bg-voicesNext-surface hover:text-voicesNext-orange focus:bg-voicesNext-surface focus:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange",
                isActive(pathname, link.href) && "text-voicesNext-orange",
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

  if (status === "loading") return null;

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
          href={`/sign-in?next=${encodeURIComponent(pathname || "/")}`}
          onClick={onNavigate}
          className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
          className="flex items-center gap-3 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
        className="text-left font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream/70 transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
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
  // Falls back to /join, not VOICES_APPLY_FOR_SHOW_URL (that's the
  // apply-to-host-a-show form) — a "Become a Supporter" button that isn't
  // explicitly configured in Sanity should still go somewhere related to
  // becoming a supporter.
  const supporterLink = settings.applyLink || "/join";
  const contactLink = settings.contactLink || "/chat";
  const trimmedSearchQuery = searchQuery.trim();
  const searchReady = trimmedSearchQuery.length >= 2;
  const searchHasResults = hasSearchResults(searchResults);
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

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
    if (!searchOpen || !searchReady) {
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
  }, [searchOpen, searchReady, trimmedSearchQuery]);

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

  function handleSearchButtonClick() {
    if (!searchOpen) {
      setSearchOpen(true);
      return;
    }

    submitSearch();
  }

  return (
    <header className="sticky top-0 z-40 bg-voicesNext-background">
      <div className="grid h-[60px] grid-cols-[1fr_auto_1fr] items-center bg-gradient-to-b from-[#444] to-voicesNext-background to-[80%] px-[9px] py-[7px] md:hidden">
        <MobileHeaderArtwork />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center justify-self-end text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
          className="ml-auto hidden items-center gap-5 md:flex lg:gap-7 xl:gap-10"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]"
            data-active={isActive(pathname, "/")}
            aria-current={isActive(pathname, "/") ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={cn(
              "voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]",
            )}
            data-active={isActive(pathname, "/explore")}
            aria-current={isActive(pathname, "/explore") ? "page" : undefined}
          >
            Explore
          </Link>
          <CollaborateDropdown pathname={pathname} />
          <a
            href={shopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]"
          >
            Shop
          </a>
        </nav>

        <div className="ml-3 flex h-[54px] items-center gap-2 md:ml-4 md:h-[72px] lg:ml-7 lg:gap-3">
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
                placeholder="Search"
                className={cn(
                  "h-9 min-w-0 border border-voicesNext-border bg-voicesNext-background px-3 font-gabarito text-sm font-bold text-voicesNext-cream outline-none transition-all duration-200 placeholder:text-voicesNext-secondary focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-10",
                  searchOpen
                    ? "mr-2 w-[52vw] max-w-[260px] opacity-100 md:w-[220px] lg:w-[280px]"
                    : "pointer-events-none mr-0 w-0 border-transparent px-0 opacity-0",
                )}
              />
              <button
                type="button"
                className="inline-flex h-[54px] w-10 shrink-0 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[72px] md:w-11"
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
                <div className="border-b border-voicesNext-border px-4 py-3">
                  <p className="font-asap text-[11px] font-bold uppercase tracking-[1px] text-voicesNext-secondary">
                    Search
                  </p>
                  <p className="mt-1 truncate font-gabarito text-sm font-bold text-voicesNext-cream">
                    {trimmedSearchQuery}
                  </p>
                </div>

                {!searchReady && (
                  <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
                    Type at least 2 characters.
                  </p>
                )}

                {searchReady && searchLoading && !searchResults && (
                  <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
                    Searching...
                  </p>
                )}

                {searchReady && searchError && (
                  <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
                    {searchError}
                  </p>
                )}

                {searchReady &&
                  searchResults &&
                  !searchLoading &&
                  !searchError &&
                  !searchHasResults && (
                    <p className="px-4 py-5 font-asap text-sm text-voicesNext-secondary">
                      No results found.
                    </p>
                  )}

                {searchReady && searchHasResults && (
                  <div className="divide-y divide-voicesNext-border">
                    {searchSections.map((section) => {
                      const items = searchResults?.[section.key] ?? [];

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
                                  className="block px-2 py-2 transition-colors hover:bg-voicesNext-surface focus:bg-voicesNext-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-voicesNext-orange"
                                  onClick={() => setSearchOpen(false)}
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
              </div>
            )}
          </div>
          <AccountMenu />
          <button
            type="button"
            className="inline-flex h-[54px] w-10 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[72px] md:w-11"
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

      {open && (
        <div
          id="site-navigation-menu"
          className="min-h-dvh fixed inset-0 z-50 bg-voicesNext-background text-voicesNext-cream"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="min-h-dvh flex flex-col md:hidden">
            <div className="grid h-[60px] grid-cols-[1fr_auto_1fr] items-center px-[14px] py-[7px]">
              <MobileHeaderArtwork />
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center justify-self-end font-gabarito text-[36px] font-medium leading-none text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X aria-hidden="true" size={26} strokeWidth={3} />
              </button>
            </div>

            <nav
              className="mt-[70px] flex flex-col gap-[25px] px-6"
              aria-label="Menu"
            >
              <Link
                href="/"
                className={cn(
                  "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
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
                  "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
                  isActive(pathname, "/explore") ||
                    isActive(pathname, "/artists")
                    ? "text-voicesNext-orange"
                    : "text-voicesNext-cream",
                )}
                aria-current={
                  isActive(pathname, "/explore") ? "page" : undefined
                }
              >
                Discover
              </Link>
              <div className="flex flex-col gap-3">
                <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[1px] text-voicesNext-secondary">
                  Collaborate
                </p>
                {collaborateLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
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
              <a
                href={shopLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
              >
                Shop
              </a>
              <Link
                href="/about"
                className={cn(
                  "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
                  isActive(pathname, "/about")
                    ? "text-voicesNext-orange"
                    : "text-voicesNext-cream",
                )}
              >
                About
              </Link>
              <Link
                href="/support"
                className={cn(
                  "font-gabarito text-[20px] font-bold leading-none focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
                  isActive(pathname, "/support")
                    ? "text-voicesNext-orange"
                    : "text-voicesNext-cream",
                )}
              >
                Support Us
              </Link>
              <a
                href={contactLink}
                className="font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
              >
                Contact
              </a>
            </nav>

            <MobileAccountLinks
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />

            <div className="mt-auto">
              <div className="px-[23px] pb-6">
                <a
                  href={supporterLink}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-voicesNext-orange px-6 font-gabarito text-[20px] font-medium text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                >
                  Become a Supporter
                </a>
              </div>
            </div>
          </div>

          <div className="min-h-dvh hidden px-2 py-0 md:block md:px-3">
            <div className="flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-voicesNext-border text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
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
                  className={cn(
                    "font-gabarito text-3xl font-bold text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background",
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
                  className="transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                >
                  Contact
                </a>
              )}
              {settings.instagramLink && (
                <a
                  href={settings.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                >
                  Instagram
                </a>
              )}
              {settings.mixcloudLink && (
                <a
                  href={settings.mixcloudLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background"
                >
                  Mixcloud
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
