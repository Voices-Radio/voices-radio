"use client";

import { useId } from "react";
import { formatMinorUnits } from "@/lib/voices/membership/format";

/** Past this many marks the dial reads as a ruler, not a set of choices. */
const MAX_TICKS = 25;

/**
 * Tick positions (0–100, percent along the track) for the dial under the
 * slider: one per step, thinned evenly when the step is fine enough that
 * every step would crowd the track. Always includes both ends.
 */
export function buildTickPositions(
  minMinor: number,
  maxMinor: number,
  stepMinor: number,
): number[] {
  const span = maxMinor - minMinor;
  if (span <= 0 || stepMinor <= 0) return [];

  const steps = Math.round(span / stepMinor);
  const count = Math.min(steps, MAX_TICKS - 1);
  return Array.from({ length: count + 1 }, (_, index) => (index / count) * 100);
}

/**
 * The sliding-scale contribution picker — replaces the old tier cards
 * entirely (see docs/plans/sliding-scale-membership.md). A native
 * `<input type="range">` rather than a custom-built slider: keyboard
 * (arrow keys, Home/End/Page) and screen-reader support come for free,
 * `aria-valuetext` overrides the announced value with a formatted price
 * instead of a bare pence integer, and the thumb is styled to a ≥44px
 * target on both WebKit and Gecko (touch-target minimum).
 *
 * The dial ticks and the large readout are decoration over that input:
 * they're aria-hidden, so assistive tech still hears one labelled slider.
 */
export default function ContributionSlider({
  minMinor,
  maxMinor,
  stepMinor,
  currency,
  value,
  onChange,
}: {
  minMinor: number;
  maxMinor: number;
  stepMinor: number;
  currency: string;
  value: number;
  onChange: (amountMinor: number) => void;
}) {
  const id = useId();
  const display = formatMinorUnits(value, currency);
  const ticks = buildTickPositions(minMinor, maxMinor, stepMinor);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="font-asap text-xs font-bold uppercase tracking-[1.2px] text-voicesNext-cream/70"
        >
          Monthly contribution
        </label>
        {/* tabular-nums: the price changes as you drag, and proportional
            digits would make the whole readout jitter sideways. */}
        <p
          data-testid="contribution-readout"
          aria-hidden="true"
          className="font-outfit text-6xl font-black leading-none tabular-nums text-voicesNext-cream"
        >
          {display}
          <span className="ml-1 font-gabarito text-base font-medium tracking-normal text-voicesNext-cream/70">
            /month
          </span>
        </p>
      </div>

      <div>
        <input
          id={id}
          type="range"
          min={minMinor}
          max={maxMinor}
          step={stepMinor}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={`${display} per month`}
          className={[
            "h-11 w-full cursor-pointer appearance-none rounded-full bg-voicesNext-border",
            "accent-voicesNext-orangeButton",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface",
            // ≥44px thumb on both engines — Tailwind's arbitrary pseudo-element
            // variants, since there's no first-class thumb utility.
            "[&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-voicesNext-orangeButton [&::-webkit-slider-thumb]:shadow-md",
            "[&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-voicesNext-orangeButton [&::-moz-range-thumb]:shadow-md",
          ].join(" ")}
        />

        {/* The thumb's centre travels from 22px to (width − 22px), so the
            tick rail is inset by half a thumb to line up with it. */}
        <div
          data-testid="contribution-ticks"
          aria-hidden="true"
          className="relative mx-[22px] mt-1 h-2"
        >
          {ticks.map((position) => (
            <span
              key={position}
              style={{ left: `${position}%` }}
              className="absolute top-0 h-2 w-px -translate-x-1/2 bg-voicesNext-secondary"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between font-asap text-xs tabular-nums text-voicesNext-cream/70">
        <span>{formatMinorUnits(minMinor, currency)}</span>
        <span>{formatMinorUnits(maxMinor, currency)}</span>
      </div>
    </div>
  );
}
