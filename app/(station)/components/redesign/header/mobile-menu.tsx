"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/voices/page-copy";
import BrandMark from "../brand-mark";
import { MobileAccountLinks } from "./mobile-account-links";
import { MobileHeaderArtwork } from "./mobile-header-parts";
import { isActive } from "./nav";
import { SearchPanel } from "./search-panel";
import { getFirstSearchResult } from "./search-model";
import type { SiteSearch } from "./use-site-search";

// Always the membership signup page. The CMS "Apply Link" is the radio-show
// submission form, so it must not be the fallback for "Join Voices".
const SUPPORTER_LINK = "/join";

type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  shopLink: string;
  contactLink: string;
  collaborateLinks: NavLink[];
  desktopMenuLinks: NavLink[];
  /** Raw CMS links shown in the tablet+ footer row (only when configured). */
  footerLinks: {
    contactLink?: string;
    instagramLink?: string;
    mixcloudLink?: string;
  };
  search: SiteSearch;
  /** Closes the desktop search dropdown when a result is chosen here. */
  onSearchNavigate: () => void;
};

/**
 * The full-screen navigation dialog: the phone menu (with search and account
 * links) and the tablet+ link list. Radix Dialog supplies Escape, the focus
 * trap and focus restore to whichever button opened it.
 */
export function MobileMenu({
  open,
  onOpenChange,
  pathname,
  shopLink,
  contactLink,
  collaborateLinks,
  desktopMenuLinks,
  footerLinks,
  search,
  onSearchNavigate,
}: MobileMenuProps) {
  const router = useRouter();

  function handleMobileSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstResult = getFirstSearchResult(search.results);
    if (!firstResult?.url) return;

    onOpenChange(false);
    router.push(firstResult.url);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onOpenChange(false)}
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
                    value={search.query}
                    onChange={(event) => search.setQuery(event.target.value)}
                    placeholder="Search shows, artists…"
                    aria-autocomplete="list"
                    aria-controls="mobile-search-results"
                    className="h-11 min-w-0 flex-1 bg-transparent font-gabarito text-base font-bold text-voicesNext-cream outline-none placeholder:font-normal placeholder:text-voicesNext-secondary"
                  />
                  {search.query && (
                    <button
                      type="button"
                      onClick={() => search.setQuery("")}
                      aria-label="Clear search"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-voicesNext-secondary transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
                    >
                      <X aria-hidden="true" size={18} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </form>

              {search.trimmedQuery && (
                <div
                  id="mobile-search-results"
                  role="region"
                  aria-live="polite"
                  className="mt-3 max-h-[45vh] overflow-y-auto border border-voicesNext-border bg-voicesNext-background"
                >
                  <SearchPanel
                    query={search.trimmedQuery}
                    ready={search.ready}
                    loading={search.loading}
                    error={search.error}
                    results={search.results}
                    hasResults={search.hasResults}
                    onNavigate={() => {
                      onSearchNavigate();
                      onOpenChange(false);
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
                    rel={link.opensInNewTab ? "noopener noreferrer" : undefined}
                    onClick={() => onOpenChange(false)}
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
              onNavigate={() => onOpenChange(false)}
            />

            <div className="mt-auto">
              <div className="px-[23px] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
                <a
                  href={SUPPORTER_LINK}
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
                onClick={() => onOpenChange(false)}
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
              {footerLinks.contactLink && (
                <a
                  href={footerLinks.contactLink}
                  className="transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                >
                  Contact
                </a>
              )}
              {footerLinks.instagramLink && (
                <a
                  href={footerLinks.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                >
                  Instagram
                </a>
              )}
              {footerLinks.mixcloudLink && (
                <a
                  href={footerLinks.mixcloudLink}
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
  );
}
