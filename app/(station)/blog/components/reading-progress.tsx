"use client";

import { useEffect, useState } from "react";

/**
 * A transmission line across the top of the viewport tracking how far
 * through the article you are.
 *
 * Long reads are the one place on this site with no other sense of
 * progress — the Goal-Gradient/Zeigarnik pull only works if the remaining
 * distance is visible. Sits at z-[45]: above the sticky header (z-40),
 * below the full-screen mobile menu (z-50), and offset by the iOS safe-area
 * inset so it never draws into the status bar.
 *
 * Decorative and duplicated by the scrollbar, so it is hidden from
 * assistive tech.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      setProgress(
        scrollable <= 0
          ? 0
          : Math.min(1, Math.max(0, window.scrollY / scrollable)),
      );
    }

    function onScroll() {
      // One measurement per frame — scroll fires far faster than paint.
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-[env(safe-area-inset-top,0px)] z-[45] h-[3px]"
    >
      <div
        className="h-full origin-left bg-voicesNext-orange"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
