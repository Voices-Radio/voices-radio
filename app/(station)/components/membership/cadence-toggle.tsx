"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MembershipCadence } from "@/lib/voices/membership/types";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import AnnualDiscountBadge from "./annual-discount-badge";

/**
 * Billing cadence control. The current value is read from the URL
 * (?cadence=) server-side and passed in as a prop, so refresh/back/forward
 * always render the correct prices without a JS round trip — this control
 * just keeps the URL in sync when the visitor changes it.
 */
export default function CadenceToggle({
  cadence,
  annualDiscountPercent = null,
}: {
  cadence: MembershipCadence;
  /** Server-derived discount (contract §2) — shown on the Annual option when positive. */
  annualDiscountPercent?: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(value: MembershipCadence) {
    if (value === cadence) return;
    trackMembershipEvent({
      name: "membership_cadence_toggled",
      cadence: value,
    });
    router.replace(`${pathname}?cadence=${value}`, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Billing cadence"
      className="grid w-fit grid-cols-2 rounded-full border border-voicesNext-border bg-voicesNext-background p-1"
    >
      {(
        [
          { value: "monthly" as const, label: "Monthly" },
          { value: "annual" as const, label: "Annual" },
        ]
      ).map((option) => {
        const active = option.value === cadence;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => handleChange(option.value)}
            className={cn(
              "flex h-11 min-w-[104px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 font-gabarito text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-surface",
              active
                ? "bg-voicesNext-orangeButton text-white"
                : "text-voicesNext-cream hover:text-voicesNext-orange",
            )}
          >
            {option.label}
            {/* The saving is plain accent text, and only shows on the inactive
                option — exactly when it's doing its job. Once Annual is
                selected the price readout carries the saving instead. */}
            {option.value === "annual" && !active && (
              <AnnualDiscountBadge
                discountPercent={annualDiscountPercent}
                variant="inline"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
