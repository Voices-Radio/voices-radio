import { cn } from "@/lib/utils";

/**
 * Progress through the membership journey: choose a tier, create an account,
 * pay. The flow had no step count anywhere, so a visitor part-way through had
 * no way to tell whether they were nearly done or nearly starting — and the
 * only hint of what came next was a line in a sidebar that mobile pushed
 * below the submit button.
 */
const steps = ["Choose your tier", "Create account", "Payment"] as const;

export type JoinStep = 1 | 2 | 3;

export default function JoinSteps({ current }: { current: JoinStep }) {
  return (
    <nav aria-label="Join progress">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {steps.map((label, index) => {
          const position = index + 1;
          const done = position < current;
          const active = position === current;

          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "font-asap text-[11px] font-bold uppercase tracking-[1.2px]",
                  // Measured against voicesNext-background: orangeText 5.39:1,
                  // cream/70 7.37:1, secondary 5.45:1. cream/40 was the
                  // obvious choice for "not reached yet" and lands at 3.39:1,
                  // under the 4.5:1 small-text minimum — hence the token.
                  active && "text-voicesNext-orangeText",
                  done && "text-voicesNext-cream/70",
                  !active && !done && "text-voicesNext-secondary",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span className="sr-only">
                  {done ? "Completed: " : active ? "Current step: " : ""}
                  {`Step ${position} of ${steps.length}, `}
                </span>
                {label}
              </span>
              {position < steps.length && (
                <span
                  aria-hidden="true"
                  className="font-asap text-[11px] text-voicesNext-cream/30"
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
