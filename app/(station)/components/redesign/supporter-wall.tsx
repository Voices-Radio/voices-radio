"use client";

import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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

// The wall grows with the supporter count. Below MIN_NAMES_TO_SCROLL there
// aren't enough names to fill a row, so a marquee would just loop one name
// back and forth — those render as a still, centred line instead. Each
// marquee row shows the same names rotated by a different offset so a longer
// list never lines up into vertical columns.
const MIN_NAMES_TO_SCROLL = 4;
const MAX_ROWS = 5;

function rowCountFor(nameCount: number): number {
  if (nameCount < MIN_NAMES_TO_SCROLL) return 0;
  if (nameCount < 10) return 2;
  if (nameCount < 20) return 3;
  return MAX_ROWS;
}

// Per-row speeds/directions are deliberately uneven — five identical
// marquees read as one moving block rather than a wall of names.
const ROW_SPEEDS = [34, 27, 41, 30, 37];

function StaticNames({
  names,
  centered,
}: {
  names: readonly string[];
  centered: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-wrap gap-x-2 gap-y-1 ${centered ? "justify-center" : ""}`}
    >
      {names.map((name, index) => (
        <span
          key={`${name}-${index}`}
          data-testid="supporter-name"
          className="font-gabarito text-[15px] font-medium text-voicesNext-cream"
        >
          {name}
          {index < names.length - 1 ? (
            <span className="ml-2 text-voicesNext-orange">·</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

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
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const rowCount = rowCountFor(names.length);

  return (
    <div ref={containerRef} className="w-full">
      <p className="mb-3 font-gabarito text-[13px] font-bold uppercase leading-[19px] tracking-wide text-white">
        Supported by
      </p>

      {/* Decorative — the moving/looping marquee (or its static reduced-motion
          stand-in) is hidden from assistive tech; the sr-only list below it
          is the one real, non-duplicated reading of the names. */}
      {rowCount === 0 || reducedMotion ? (
        <StaticNames names={order} centered={rowCount === 0} />
      ) : (
        <div
          aria-hidden="true"
          className="flex flex-col gap-1 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
        >
          {toRows(order, rowCount).map((row, rowIndex) => (
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
