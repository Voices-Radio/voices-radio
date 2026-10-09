"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_COLLABORATE_LINKS,
  DEFAULT_DESKTOP_MENU_LINKS,
  type NavLink,
} from "@/lib/voices/page-copy";
import { cn } from "@/lib/utils";
import AccountMenu from "./account-menu";
import BrandMark from "./brand-mark";
import { CollaborateDropdown } from "./header/collaborate-dropdown";
import { MobileMenu } from "./header/mobile-menu";
import {
  MobileHeaderArtwork,
  MobileOnAirTicker,
  WavyMenuIcon,
} from "./header/mobile-header-parts";
import { isActive } from "./header/nav";
import { getFirstSearchResult } from "./header/search-model";
import { SearchPanel } from "./header/search-panel";
import { useSiteSearch } from "./header/use-site-search";

const SHOP_FALLBACK_URL = "https://shop.voicesradio.co.uk/";

type HeaderSettings = {
  contactLink?: string;
  storeLink?: string;
  instagramLink?: string;
  mixcloudLink?: string;
  /** Resolved from the CMS in the shell; the built-in menus apply when omitted. */
  desktopMenuLinks?: NavLink[];
  collaborateLinks?: NavLink[];
};

export default function SiteHeader({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const desktopMenuLinks =
    settings.desktopMenuLinks ?? DEFAULT_DESKTOP_MENU_LINKS;
  const collaborateLinks =
    settings.collaborateLinks ?? DEFAULT_COLLABORATE_LINKS;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const shopLink = settings.storeLink || SHOP_FALLBACK_URL;
  const contactLink = settings.contactLink || "/chat";
  // Desktop reveals the field behind a toggle; the mobile menu shows it
  // outright. Either counts as "the visitor is searching", so the fetch has to
  // watch both rather than just the desktop toggle.
  const search = useSiteSearch(searchOpen || open);
  const searchButtonLabel = searchOpen
    ? search.trimmedQuery
      ? "Submit search"
      : "Close search"
    : "Open search";

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    search.reset();
    // `search.reset` is stable; resetting is keyed to navigation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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

  function submitSearch() {
    if (!search.trimmedQuery) {
      setSearchOpen(false);
      return;
    }

    const firstResult = getFirstSearchResult(search.results);

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
          <CollaborateDropdown
            pathname={pathname}
            collaborateLinks={collaborateLinks}
          />
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
                value={search.query}
                tabIndex={searchOpen ? 0 : -1}
                aria-hidden={!searchOpen}
                aria-autocomplete="list"
                aria-controls="site-search-results"
                onChange={(event) => search.setQuery(event.target.value)}
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

            {searchOpen && search.trimmedQuery && (
              <div
                id="site-search-results"
                className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-[calc(100vw-1rem)] max-w-[440px] overflow-y-auto border border-voicesNext-border bg-voicesNext-background shadow-2xl md:w-[440px]"
                role="region"
                aria-live="polite"
              >
                <SearchPanel
                  query={search.trimmedQuery}
                  ready={search.ready}
                  loading={search.loading}
                  error={search.error}
                  results={search.results}
                  hasResults={search.hasResults}
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

      <MobileMenu
        open={open}
        onOpenChange={setOpen}
        pathname={pathname}
        shopLink={shopLink}
        contactLink={contactLink}
        collaborateLinks={collaborateLinks}
        desktopMenuLinks={desktopMenuLinks}
        footerLinks={{
          contactLink: settings.contactLink,
          instagramLink: settings.instagramLink,
          mixcloudLink: settings.mixcloudLink,
        }}
        search={search}
        onSearchNavigate={() => setSearchOpen(false)}
      />
    </header>
  );
}
