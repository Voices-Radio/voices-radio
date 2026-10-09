"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/voices/page-copy";
import { isActive } from "./nav";

export function CollaborateDropdown({
  pathname,
  collaborateLinks,
}: {
  pathname: string;
  collaborateLinks: NavLink[];
}) {
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
