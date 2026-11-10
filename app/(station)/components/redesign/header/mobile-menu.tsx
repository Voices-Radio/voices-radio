"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import type { NavLink } from "@/lib/voices/page-copy";
import { readEmailFromMailto } from "@/lib/voices/mailto";
import BrandMark from "../brand-mark";
import ContactEmailCopy from "../contact-email-copy";
import {
  type MenuItem,
  MenuSectionLabel,
  MenuSocialLinks,
  PrimaryMenuLink,
  SecondaryMenuLink,
} from "./menu-links";
import { MobileAccountLinks } from "./mobile-account-links";
import { MobileHeaderArtwork } from "./mobile-header-parts";
import { isActive } from "./nav";
import { SearchPanel } from "./search-panel";
import { getFirstSearchResult } from "./search-model";
import type { SiteSearch } from "./use-site-search";

// Always the membership signup page. The CMS "Apply Link" is the radio-show
// submission form, so it must not be the fallback for "Join Voices".
const SUPPORTER_LINK = "/join";

const EXPLORE_LINK: NavLink = {
  href: "/explore",
  label: "Explore",
  opensInNewTab: false,
};

const ARCHIVE_LINK: NavLink = {
  href: "/shows",
  label: "Archive",
  opensInNewTab: false,
};

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
  const contactEmail = readEmailFromMailto(contactLink);
  const footerContactEmail = readEmailFromMailto(footerLinks.contactLink);
  // Archive is built in rather than CMS-supplied, so it shows even when Sanity
  // provides its own menu list. It sits straight after Home.
  // The tablet and desktop menu opens with the same items as the top bar
  // (Home, Explore, Shop) so the two menus read as one list.
  const topBarHrefs = new Set(["/", "/explore", "/shows", shopLink]);
  const tabletMenuLinks: NavLink[] = [
    { href: "/", label: "Home", opensInNewTab: false },
    EXPLORE_LINK,
    ARCHIVE_LINK,
    { href: shopLink, label: "Shop", opensInNewTab: true },
    ...desktopMenuLinks.filter((link) => !topBarHrefs.has(link.href)),
  ];

  const closeMenu = () => onOpenChange(false);
  const toMenuItem = (link: NavLink): MenuItem => ({
    href: link.href,
    label: link.label,
    external: link.opensInNewTab,
    active: isActive(pathname, link.href),
  });

  const phonePrimaryItems: MenuItem[] = [
    { href: "/", label: "Home", active: isActive(pathname, "/") },
    {
      href: "/explore",
      label: "Explore",
      active: isActive(pathname, "/explore") || isActive(pathname, "/artists"),
    },
    { href: "/shows", label: "Archive", active: isActive(pathname, "/shows") },
    { href: shopLink, label: "Shop", external: true },
  ];
  const collaborateItems = collaborateLinks.map(toMenuItem);
  const stationItems: MenuItem[] = [
    { href: "/about", label: "About", active: isActive(pathname, "/about") },
    {
      href: "/support",
      label: "Membership",
      active: isActive(pathname, "/support"),
    },
    {
      href: contactLink,
      label: "Contact",
      active: contactLink.startsWith("/") && isActive(pathname, contactLink),
    },
  ];
  const tabletItems = tabletMenuLinks.map(toMenuItem);

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
          className="min-h-dvh fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-voicesNext-background text-voicesNext-cream focus:outline-none"
          aria-label="Navigation menu"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
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

            <nav className="mt-6 flex flex-col px-6" aria-label="Menu">
              <div className="border-t border-voicesNext-border">
                {phonePrimaryItems.map((item) => (
                  <PrimaryMenuLink
                    key={item.label}
                    item={item}
                    size="phone"
                    onNavigate={closeMenu}
                  />
                ))}
              </div>

              <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-9">
                <div className="flex flex-col gap-4">
                  <MenuSectionLabel>Work with Us</MenuSectionLabel>
                  {collaborateItems.map((item) => (
                    <SecondaryMenuLink
                      key={item.href}
                      item={item}
                      onNavigate={closeMenu}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <MenuSectionLabel>Voices</MenuSectionLabel>
                  {stationItems.map((item) => (
                    <SecondaryMenuLink
                      key={item.label}
                      item={item}
                      onNavigate={closeMenu}
                    />
                  ))}
                </div>
              </div>
              {contactEmail && (
                <ContactEmailCopy
                  email={contactEmail}
                  className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-gabarito text-xs font-medium text-voicesNext-secondary"
                  addressClassName="select-all break-all text-voicesNext-cream"
                />
              )}
            </nav>

            <MobileAccountLinks
              pathname={pathname}
              onNavigate={() => onOpenChange(false)}
            />

            <div className="mt-9 px-6">
              <MenuSocialLinks
                instagramLink={footerLinks.instagramLink}
                mixcloudLink={footerLinks.mixcloudLink}
              />
            </div>

            {/*
                Solid background + sticky: the pill used to sit flush against
                the iOS Safari toolbar, which sampled its orange as the toolbar
                tint. Now the toolbar samples the dark panel, and the CTA stays
                reachable while the menu scrolls.
              */}
            <div className="sticky bottom-0 mt-auto bg-voicesNext-background">
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

            <nav className="mt-12 grid grid-cols-2 gap-x-10 border-t border-voicesNext-border" aria-label="Menu">
              {tabletItems.map((item) => (
                <PrimaryMenuLink
                  key={item.href}
                  item={item}
                  size="tablet"
                  onNavigate={closeMenu}
                />
              ))}
            </nav>

            <div className="mt-12 flex flex-wrap items-end justify-between gap-8 pb-10">
              <div className="flex flex-col gap-3 font-gabarito text-sm font-bold uppercase text-voicesNext-secondary">
                {footerLinks.contactLink && (
                  <>
                    <MenuSectionLabel>Get in touch</MenuSectionLabel>
                    <a
                      href={footerLinks.contactLink}
                      className="text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background"
                    >
                      Contact
                    </a>
                  </>
                )}
                {footerContactEmail && (
                  <ContactEmailCopy
                    email={footerContactEmail}
                    className="flex flex-wrap items-center gap-x-2 normal-case"
                    addressClassName="select-all break-all font-medium text-voicesNext-cream"
                  />
                )}
              </div>
              <MenuSocialLinks
                instagramLink={footerLinks.instagramLink}
                mixcloudLink={footerLinks.mixcloudLink}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
