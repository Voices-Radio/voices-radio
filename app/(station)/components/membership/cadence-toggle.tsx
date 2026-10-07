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
      className="inline-flex rounded-full border border-voicesNext-border bg-voicesNext-surface p-1"
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
              "flex min-w-[112px] items-center justify-center gap-1.5 rounded-full px-5 font-gabarito text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface",
              active
                ? "bg-voicesNext-orangeButton text-white"
                : "text-voicesNext-cream hover:text-voicesNext-orange",
            )}
          >
            {option.label}
            {/* The badge's own orange background would wash out against an
                already-orange active pill, so it only shows as an enticement
                on the inactive option — exactly when it's doing its job. */}
            {option.value === "annual" && !active && (
              <AnnualDiscountBadge discountPercent={annualDiscountPercent} />
            )}
          </button>
        );
      })}
    </div>
  );
}
