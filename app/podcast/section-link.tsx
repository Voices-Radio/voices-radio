"use client";

import type { ReactNode } from "react";

/**
 * Smooth-scroll to an in-page section. The only interactivity the footer
 * needs, kept as a tiny client island so the rest of /podcast can render on
 * the server.
 */
export function SectionLink({
  sectionId,
  className,
  onNavigate,
  children,
}: {
  sectionId: string;
  className?: string;
  /** Called after a successful scroll (e.g. to close the mobile menu). */
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          onNavigate?.();
        }
      }}
    >
      {children}
    </button>
  );
}
