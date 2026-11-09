"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionLink } from "./section-link";

const NAV_ITEMS = [
  { label: "Home", sectionId: "home" },
  { label: "About", sectionId: "about" },
  { label: "Studio", sectionId: "studio" },
  { label: "Services", sectionId: "services" },
  { label: "Equipment", sectionId: "technology" },
  { label: "Blog", href: "/podcast/blog" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "Contact", sectionId: "contact" },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

function NavEntry({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
  if ("href" in item) {
    return (
      <Link href={item.href} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <SectionLink
      sectionId={item.sectionId}
      className={className}
      onNavigate={onNavigate}
    >
      {item.label}
    </SectionLink>
  );
}

/**
 * The fixed top bar: transparent over the hero, solid once scrolled, with a
 * mobile menu. The only part of /podcast that needs the browser's scroll
 * position, so it is the only client component on the page apart from the
 * footer's SectionLink.
 */
export function PodcastNav() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      aria-label="Voices Studio"
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="ml-2 flex items-center space-x-2">
            <Image
              src="/VOICESLOGO_LIGHTBOX.png"
              alt="Voices Studio Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span
              className={`text-xl font-bold ${
                isScrolled ? "text-slate-800" : "text-white"
              }`}
            >
              Voices Studio
            </span>
          </div>

          <div className="hidden md:block">
            <div className="mr-2 flex items-center space-x-6">
              {NAV_ITEMS.map((item) => (
                <NavEntry
                  key={item.label}
                  item={item}
                  className={`font-medium capitalize transition-colors duration-200 hover:text-accent ${
                    isScrolled ? "text-slate-600" : "text-white"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsNavOpen((open) => !open)}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isNavOpen}
              className={isScrolled ? "text-slate-800" : "text-white"}
            >
              {isNavOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isNavOpen && (
        <div className="bg-white shadow-lg md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {NAV_ITEMS.map((item) => (
              <NavEntry
                key={item.label}
                item={item}
                onNavigate={() => setIsNavOpen(false)}
                className="block w-full px-3 py-2 text-left font-medium capitalize text-slate-600 hover:text-accent"
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
