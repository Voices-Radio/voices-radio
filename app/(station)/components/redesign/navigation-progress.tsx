"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Navigations that finish faster than this never show the bar, so prefetched
// pages don't flash it.
export const SHOW_DELAY_MS = 150;
// If a click never turns into a navigation (a handler cancelled it, or the
// request failed), the bar still goes away.
export const GIVE_UP_MS = 12000;
export const FINISH_MS = 350;

type Phase = "idle" | "loading" | "finishing";

/**
 * The URL a plain left click on a same-origin link will navigate to, or null
 * when the click opens a new tab, downloads, leaves the site, or only moves
 * to a #hash on the current page.
 */
export function getInternalNavigationTarget(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const target = event.target;
  if (!(target instanceof Element)) return null;

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return null;
  }

  return `${url.pathname}${url.search}`;
}

/**
 * A thin orange bar along the top of the page while a link click loads the
 * next page. It starts on the click and finishes when the route changes.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const [phase, setPhase] = useState<Phase>("idle");
  const showTimer = useRef<number>();
  const giveUpTimer = useRef<number>();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!getInternalNavigationTarget(event)) return;

      window.clearTimeout(showTimer.current);
      window.clearTimeout(giveUpTimer.current);
      showTimer.current = window.setTimeout(
        () => setPhase("loading"),
        SHOW_DELAY_MS,
      );
      giveUpTimer.current = window.setTimeout(
        () => setPhase("idle"),
        GIVE_UP_MS,
      );
    }

    // Capture phase: next/link calls preventDefault() in its own handler, so
    // the click has to be seen before that happens.
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // A route change ends whatever navigation was in flight.
  useEffect(() => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(giveUpTimer.current);
    setPhase((current) => (current === "loading" ? "finishing" : "idle"));
  }, [routeKey]);

  useEffect(() => {
    if (phase !== "finishing") return;

    const timer = window.setTimeout(() => setPhase("idle"), FINISH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(
    () => () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(giveUpTimer.current);
    },
    [],
  );

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      data-testid="navigation-progress"
      className="voices-nav-progress pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-voicesNext-orange"
    />
  );
}
