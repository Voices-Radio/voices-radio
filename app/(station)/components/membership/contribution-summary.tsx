"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ContributionSlider from "./contribution-slider";
import AnnualDiscountBadge from "./annual-discount-badge";
import CadenceToggle from "./cadence-toggle";
import { formatMinorUnits } from "@/lib/voices/membership/format";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import type {
  MembershipAnnualView,
  MembershipCadence,
  MembershipScaleView,
} from "@/lib/voices/membership/types";
import { accountPrimaryButtonClassName } from "../../account/components/account-surface";

/**
 * The single contribution picker that replaced the four-tier comparison
 * table (see docs/plans/sliding-scale-membership.md) — there is nothing to
 * compare anymore, just one amount to choose. Monthly shows the slider;
 * annual shows the one fixed price with its discount badge.
 */
export default function ContributionSummary({
  scale,
  annual,
  cadence,
  ctaBasePath,
  ctaNext,
  scaleBody,
}: {
  scale: MembershipScaleView;
  annual: MembershipAnnualView | null;
  cadence: MembershipCadence;
  /**
   * Where "Continue" sends a visitor. /join passes "/join/checkout" for an
   * already-signed-in visitor (skips account creation) and leaves the
   * default for a signed-out one.
   */
  ctaBasePath?: string;
  /**
   * Where a visitor was headed before /join (e.g. the artist page whose
   * heart they tapped). Carried on to account creation so an existing
   * account can sign in and land back there.
   */
  ctaNext?: string;
  /** Sanity-authored, tier-free copy shown under the picker. */
  scaleBody?: string;
}) {
  const [monthlyAmount, setMonthlyAmount] = useState(scale.defaultMinor);
  const annualAvailable = cadence === "annual" && annual;
  const chosenAmount = annualAvailable ? annual.amountMinor : monthlyAmount;
  const currency = annualAvailable ? annual.currency : scale.currency;
  const canContinue = cadence === "monthly" || Boolean(annual);

  const ctaHref = `${ctaBasePath ?? "/join/create-account"}?amount=${chosenAmount}&cadence=${cadence}${
    ctaNext ? `&next=${encodeURIComponent(ctaNext)}` : ""
  }`;

  return (
    <div className="flex w-full flex-col gap-5 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-5 md:p-6">
      <CadenceToggle
        cadence={cadence}
        annualDiscountPercent={annual?.discountPercent ?? null}
      />

      {cadence === "monthly" ? (
        <ContributionSlider
          minMinor={scale.minMinor}
          maxMinor={scale.maxMinor}
          stepMinor={scale.stepMinor}
          currency={scale.currency}
          value={monthlyAmount}
          onChange={setMonthlyAmount}
        />
      ) : annual ? (
        <div className="flex flex-col gap-2">
          <p className="font-asap text-xs font-bold uppercase tracking-[1.2px] text-voicesNext-cream/70">
            Annual contribution
          </p>
          <p className="font-outfit text-6xl font-black leading-none tabular-nums text-voicesNext-cream">
            {formatMinorUnits(annual.amountMinor, annual.currency)}
            <span className="ml-1 font-gabarito text-base font-medium tracking-normal text-voicesNext-cream/70">
              /year
            </span>
          </p>
          <div>
            <AnnualDiscountBadge discountPercent={annual.discountPercent} />
          </div>
        </div>
      ) : (
        <p className="font-gabarito text-sm text-voicesNext-cream/70">
          Annual billing isn&rsquo;t available right now — choose monthly
          instead.
        </p>
      )}

      {scaleBody && (
        <p className="font-asap text-sm leading-relaxed text-voicesNext-cream/70">
          {scaleBody}
        </p>
      )}

      {canContinue && (
        <div className="flex flex-col gap-3">
          <Link
            href={ctaHref}
            onClick={() =>
              trackMembershipEvent({
                name: "membership_amount_viewed",
                amountMinor: chosenAmount,
                cadence,
              })
            }
            className={cn(
              accountPrimaryButtonClassName,
              "h-12 w-full px-6 text-base",
            )}
          >
            Continue — {formatMinorUnits(chosenAmount, currency)}/
            {cadence === "monthly" ? "month" : "year"}
          </Link>
          {/* One tap to the offer for phone visitors, where the benefits sit
              below the picker. Desktop shows them alongside. */}
          <a
            href="#member-benefits-heading"
            className="self-center font-gabarito text-sm font-bold text-voicesNext-orangeText underline underline-offset-2 hover:text-voicesNext-cream lg:hidden"
          >
            See what you get ↓
          </a>
        </div>
      )}
    </div>
  );
}
