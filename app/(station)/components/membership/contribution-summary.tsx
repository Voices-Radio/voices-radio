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
  /** Sanity-authored, tier-free copy shown under the picker. */
  scaleBody?: string;
}) {
  const [monthlyAmount, setMonthlyAmount] = useState(scale.defaultMinor);
  const annualAvailable = cadence === "annual" && annual;
  const chosenAmount = annualAvailable ? annual.amountMinor : monthlyAmount;
  const currency = annualAvailable ? annual.currency : scale.currency;
  const canContinue = cadence === "monthly" || Boolean(annual);

  const ctaHref = `${ctaBasePath ?? "/join/create-account"}?amount=${chosenAmount}&cadence=${cadence}`;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 text-center md:p-10">
      <CadenceToggle
        cadence={cadence}
        annualDiscountPercent={annual?.discountPercent ?? null}
      />

      {cadence === "monthly" ? (
        <div className="w-full">
          <ContributionSlider
            minMinor={scale.minMinor}
            maxMinor={scale.maxMinor}
            stepMinor={scale.stepMinor}
            currency={scale.currency}
            value={monthlyAmount}
            onChange={setMonthlyAmount}
          />
        </div>
      ) : annual ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-outfit text-5xl font-black text-voicesNext-cream">
            {formatMinorUnits(annual.amountMinor, annual.currency)}
            <span className="ml-1 font-gabarito text-base font-medium text-voicesNext-cream/70">
              /year
            </span>
          </p>
          <AnnualDiscountBadge discountPercent={annual.discountPercent} />
        </div>
      ) : (
        <p className="font-gabarito text-sm text-voicesNext-cream/70">
          Annual billing isn&rsquo;t available right now — choose monthly
          instead.
        </p>
      )}

      {scaleBody && (
        <p className="max-w-md font-asap text-sm leading-relaxed text-voicesNext-cream/70">
          {scaleBody}
        </p>
      )}

      {canContinue && (
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
            "h-12 w-full max-w-xs px-6 text-base",
          )}
        >
          Continue — {formatMinorUnits(chosenAmount, currency)}/
          {cadence === "monthly" ? "month" : "year"}
        </Link>
      )}
    </div>
  );
}
