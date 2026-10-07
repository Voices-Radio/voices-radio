"use client";

import { useId } from "react";
import { formatMinorUnits } from "@/lib/voices/membership/format";

/**
 * The sliding-scale contribution picker — replaces the old tier cards
 * entirely (see docs/plans/sliding-scale-membership.md). A native
 * `<input type="range">` rather than a custom-built slider: keyboard
 * (arrow keys, Home/End/Page) and screen-reader support come for free,
 * `aria-valuetext` overrides the announced value with a formatted price
 * instead of a bare pence integer, and the thumb is styled to a ≥44px
 * target on both WebKit and Gecko (touch-target minimum).
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="font-gabarito text-sm font-bold uppercase tracking-wide text-voicesNext-cream/70"
        >
          Monthly contribution
        </label>
        <span
          className="font-outfit text-4xl font-black text-voicesNext-cream"
          aria-hidden="true"
        >
          {display}
        </span>
      </div>

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
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background",
          // ≥44px thumb on both engines — Tailwind's arbitrary pseudo-element
          // variants, since there's no first-class thumb utility.
          "[&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-voicesNext-orangeButton [&::-webkit-slider-thumb]:shadow-md",
          "[&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-voicesNext-orangeButton [&::-moz-range-thumb]:shadow-md",
        ].join(" ")}
      />

      <div className="flex justify-between font-asap text-xs text-voicesNext-cream/60">
        <span>{formatMinorUnits(minMinor, currency)}</span>
        <span>{formatMinorUnits(maxMinor, currency)}</span>
      </div>
    </div>
  );
}
