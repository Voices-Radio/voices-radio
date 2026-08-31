import { cn } from "@/lib/utils";

// Bar i: shared bounce keyframe, per-bar tempo/phase from the modifier class,
// resting height from the utility class (what shows under reduced motion).
const BARS: { motion: string; height: string }[] = [
  { motion: "voices-signal-bar", height: "h-2" },
  { motion: "voices-signal-bar voices-signal-bar-2", height: "h-3.5" },
  { motion: "voices-signal-bar voices-signal-bar-3", height: "h-5" },
  { motion: "voices-signal-bar voices-signal-bar-4", height: "h-2.5" },
  { motion: "voices-signal-bar voices-signal-bar-5", height: "h-4" },
];

/**
 * Decorative output-level meter for the supporter strip's signal readout.
 * Purely broadcast flavour — hidden from assistive tech.
 */
export default function SupportSignalMeter() {
  return (
    <div
      aria-hidden="true"
      data-testid="support-signal-meter"
      className="flex h-5 items-end gap-[3px]"
    >
      {BARS.map((bar, index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] rounded-full bg-voicesNext-orange",
            bar.height,
            bar.motion,
          )}
        />
      ))}
    </div>
  );
}
