import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  MembershipCadence,
  MembershipTierView,
} from "@/lib/voices/membership/types";
import {
  accountPrimaryButtonClassName,
  accountSurfaceClassName,
} from "../../account/components/account-surface";

export default function TierCard({
  tier,
  cadence,
  ctaHref,
}: {
  tier: MembershipTierView;
  cadence: MembershipCadence;
  ctaHref: string;
}) {
  const price =
    cadence === "annual" ? tier.annualPriceDisplay : tier.monthlyPriceDisplay;
  const cadenceLabel = cadence === "annual" ? "/year" : "/month";
  const popularId = `${tier.id}-most-popular`;

  return (
    <div
      className={cn(
        accountSurfaceClassName,
        "flex flex-col gap-4",
        tier.mostPopular
          ? "border-voicesNext-orange bg-voicesNext-surface"
          : "border-voicesNext-border bg-voicesNext-background",
      )}
      aria-describedby={tier.mostPopular ? popularId : undefined}
    >
      {tier.mostPopular && (
        <p
          id={popularId}
          className="inline-flex w-fit items-center gap-1 rounded-full bg-voicesNext-orangeButton px-3 py-1 font-asap text-[11px] font-bold uppercase tracking-[1px] text-white"
        >
          Most popular
        </p>
      )}

      <div>
        <h3 className="font-gabarito text-2xl font-bold text-voicesNext-cream">
          {tier.name}
        </h3>
        <p className="mt-1 font-gabarito text-base text-voicesNext-cream/70">
          {tier.headline}
        </p>
      </div>

      <p className="font-outfit text-4xl font-black text-voicesNext-cream">
        {price}
        <span className="ml-1 font-gabarito text-base font-medium text-voicesNext-cream/70">
          {cadenceLabel}
        </span>
      </p>

      <ul className="flex flex-1 flex-col gap-2 font-asap text-sm text-voicesNext-cream/90">
        {tier.benefitBullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5 text-voicesNext-orange">
              ✓
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={cn(
          accountPrimaryButtonClassName,
          "mt-2 h-12 px-6 text-base",
        )}
      >
        Choose {tier.name}
      </Link>
    </div>
  );
}
