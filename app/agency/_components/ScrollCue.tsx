"use client";

import { ArrowDown } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * Hero's "scroll down" cue. A plain `<a href="#offer">` jumps instantly;
 * this smooth-scrolls to the target section instead, while still degrading
 * to a normal anchor jump if JS hasn't loaded yet.
 */
export function ScrollCue({ targetId }: { targetId: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${targetId}`);
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      aria-label={`Scroll to ${targetId}`}
      className="text-white/85 flex flex-col items-center gap-2 transition hover:text-voices-purple"
    >
      <span className="text-xs font-black uppercase tracking-[0.18em]">
        Scroll
      </span>
      <ArrowDown className="h-7 w-7 animate-bounce" />
    </a>
  );
}
