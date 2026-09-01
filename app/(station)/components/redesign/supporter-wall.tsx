"use client";

import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

// Fisher–Yates. Never mutates the input — callers hold their own copy of
// the previous order (React state), and deriving a "shuffled or not" diff
// from a mutated array would be impossible to reason about.
function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

// The strip is five marquee rows deep. Each row shows the same names
// rotated by a different offset so a single-supporter station still fills
// every row, and a longer list never lines up into vertical columns.
const ROW_COUNT = 5;

// Per-row speeds/directions are deliberately uneven — five identical
// marquees read as one moving block rather than a wall of names.
const ROW_SPEEDS = [34, 27, 41, 30, 37];

function toRows(names: readonly string[], rowCount: number): string[][] {
  return Array.from({ length: rowCount }, (_, row) => {
    const offset = Math.floor((names.length * row) / rowCount);
    return [...names.slice(offset), ...names.slice(0, offset)];
  });
}

/**
 * A five-row, continuously-scrolling wall of supporter recognition names
 * (set via
 * "List me on the public supporter wall" in /account/profile). Renders
 * nothing when there are no opted-in names — the caller (supporter-block)
 * falls back to its unchanged today's-markup in that case.
 *
 * Ordering is deliberately non-alphabetical and reshuffles each time this
 * section enters the viewport (including on initial load, if it's already
 * in view) — one IntersectionObserver covers both "on refresh" and "when
 * the user scrolls to the strip", so the same name isn't always the one
 * that happens to be visible first.
 *
 * The first render uses the server-provided order verbatim; shuffling only
 * ever happens inside an effect, never during render, so there's no
 * hydration mismatch between server and client markup.
 */
export default function SupporterWall({ names }: { names: string[] }) {
  const [order, setOrder] = useState(names);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOrder((current) => shuffle(current));
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (names.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full">
      <p className="mb-3 font-gabarito text-[13px] font-bold uppercase leading-[19px] tracking-wide text-white">
        Supported by
      </p>

      {/* Decorative — the moving/looping marquee (or its static reduced-motion
          stand-in) is hidden from assistive tech; the sr-only list below it
          is the one real, non-duplicated reading of the names. */}
      {reducedMotion ? (
        <div aria-hidden="true" className="flex flex-wrap gap-x-2 gap-y-1">
          {order.map((name, index) => (
            <span
              key={`${name}-${index}`}
              data-testid="supporter-name"
              className="font-gabarito text-[15px] font-medium text-voicesNext-cream"
            >
              {name}
              {index < order.length - 1 ? (
                <span className="ml-2 text-voicesNext-orange">·</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="flex flex-col gap-1 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
        >
          {toRows(order, ROW_COUNT).map((row, rowIndex) => (
            <Marquee
              key={`row-${rowIndex}`}
              gradient={false}
              pauseOnHover
              speed={ROW_SPEEDS[rowIndex % ROW_SPEEDS.length]}
              direction={rowIndex % 2 === 1 ? "right" : "left"}
              autoFill
            >
              <div className="mr-8 inline-flex items-center gap-3 whitespace-nowrap">
                {row.map((name, index) => (
                  <span
                    key={`${name}-${index}`}
                    data-testid="supporter-name"
                    className="inline-flex items-center gap-3 font-gabarito text-[15px] font-medium leading-[26px] text-voicesNext-cream"
                  >
                    {name}
                    <span className="text-voicesNext-orange" aria-hidden="true">
                      ·
                    </span>
                  </span>
                ))}
              </div>
            </Marquee>
          ))}
        </div>
      )}

      <p className="sr-only">Supported by {names.join(", ")}</p>
    </div>
  );
}
