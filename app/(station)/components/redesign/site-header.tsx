"use client";

import ScheduleDialog from "@/app/components/schedule/dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import BrandMark from "./brand-mark";

const SHOP_FALLBACK_URL = "https://shop.voicesradio.co.uk/";

type HeaderSettings = {
  applyLink?: string;
  contactLink?: string;
  storeLink?: string;
  instagramLink?: string;
  mixcloudLink?: string;
};

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcast Studio" },
  { href: "/collaborate", label: "Collaborate" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
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

export default function SiteHeader({ settings }: { settings: HeaderSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shopLink = settings.storeLink || SHOP_FALLBACK_URL;

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <header className="sticky top-0 z-40 bg-voicesNext-background">
      <div className="flex h-[54px] w-full items-center justify-between md:h-[72px] md:px-3">
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
          <ScheduleDialog classNames="voices-nav-link bg-transparent p-0 font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]" />
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
          <Link
            href="/collaborate"
            className="voices-nav-link font-gabarito text-[20px] font-bold leading-none text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background lg:text-[21px]"
            data-active={isActive(pathname, "/collaborate")}
            aria-current={
              isActive(pathname, "/collaborate") ? "page" : undefined
            }
          >
            Collaborate
          </Link>
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
                  ? "mr-2 w-[52vw] max-w-[240px] opacity-100 md:w-[190px] lg:w-[240px]"
                  : "pointer-events-none mr-0 w-0 border-transparent px-0 opacity-0",
              )}
            />
            <button
              type={searchOpen ? "submit" : "button"}
              className="inline-flex h-[54px] w-10 shrink-0 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[72px] md:w-11"
              onClick={() => {
                if (!searchOpen) {
                  setSearchOpen(true);
                }
              }}
              aria-label={searchOpen ? "Submit search" : "Open search"}
              aria-expanded={searchOpen}
              aria-controls="site-search"
            >
              <Search aria-hidden="true" size={22} strokeWidth={3.2} />
            </button>
          </form>
          <button
            type="button"
            className="inline-flex h-[54px] w-10 items-center justify-center text-voicesNext-cream transition-colors hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background md:h-[72px] md:w-11"
            onClick={() => {
              setSearchOpen(false);
              setOpen(true);
            }}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <WavyMenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="min-h-dvh fixed inset-0 z-50 bg-voicesNext-background px-2 py-0 md:px-3"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
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
            {menuLinks.map((link) => (
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
      )}
    </header>
  );
}
