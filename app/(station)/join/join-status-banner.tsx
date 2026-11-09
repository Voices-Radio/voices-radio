import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMinorUnitsWithCadence } from "@/lib/voices/membership/format";
import type { MembershipState } from "@/lib/voices/membership/schemas";
import { getResumableCheckout } from "@/lib/voices/membership/unfinished-checkout";
import {
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
} from "../account/components/account-surface";

const MEMBER_STATUSES = new Set([
  "active",
  "grace",
  "cancelling",
  "complimentary",
]);

const bannerClassName =
  "mx-auto mb-8 flex max-w-2xl flex-col items-center gap-4 rounded-voices-sm border border-voicesNext-border bg-voicesNext-surface px-4 py-4 text-center font-gabarito text-sm text-voicesNext-cream";

/**
 * What /join says to someone it already knows something about: a member who
 * wandered back here, someone who left the payment step unfinished, or someone
 * who backed out of Stripe a moment ago. At most one message, most specific
 * first, so the page never stacks three banners above the pricing.
 */
export default function JoinStatusBanner({
  membership,
  checkoutCancelled,
}: {
  membership: MembershipState | null;
  checkoutCancelled: boolean;
}) {
  if (membership?.status && MEMBER_STATUSES.has(membership.status)) {
    return (
      <div className={bannerClassName} data-testid="join-already-member">
        <p>You&rsquo;re already a Voices member.</p>
        <Link
          href="/account/membership"
          className={cn(accountSecondaryButtonClassName, "h-11 px-5 text-sm")}
        >
          Manage membership
        </Link>
      </div>
    );
  }

  const resumable = membership ? getResumableCheckout(membership) : null;
  if (resumable) {
    return (
      <div className={bannerClassName} data-testid="join-resume">
        <p>
          <strong className="font-bold">Pick up where you left off.</strong> You
          chose{" "}
          {formatMinorUnitsWithCadence(
            resumable.amountMinor,
            membership?.currency ?? "gbp",
            resumable.cadence,
          )}
          . Nothing has been charged.
        </p>
        <Link
          href={resumable.href}
          className={cn(accountPrimaryButtonClassName, "h-11 px-5 text-sm")}
        >
          Finish joining
        </Link>
      </div>
    );
  }

  if (checkoutCancelled) {
    return (
      <p role="status" data-testid="join-checkout-cancelled" className={bannerClassName}>
        No payment was taken. Pick a contribution below whenever you&rsquo;re
        ready.
      </p>
    );
  }

  return null;
}
