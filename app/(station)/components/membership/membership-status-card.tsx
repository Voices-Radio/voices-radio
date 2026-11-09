import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatMembershipDate,
  formatMinorUnitsWithCadence,
} from "@/lib/voices/membership/format";
import type { MembershipState } from "@/lib/voices/membership/schemas";
import { getResumableCheckout } from "@/lib/voices/membership/unfinished-checkout";
import {
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
  accountSurfaceClassName,
} from "../../account/components/account-surface";

type StatusKey = NonNullable<MembershipState["status"]>;

// Every state carries an icon AND a text label — never colour alone (brief
// requirement). Tone only changes the accent colour; the icon+label pair
// is what actually communicates the state.
const STATUS_META: Record<
  StatusKey,
  {
    label: string;
    icon: typeof CheckCircle2;
    tone: "positive" | "warning" | "neutral";
  }
> = {
  active: { label: "Active", icon: CheckCircle2, tone: "positive" },
  cancelling: { label: "Cancelling", icon: Clock, tone: "warning" },
  grace: {
    label: "Payment needs attention",
    icon: AlertTriangle,
    tone: "warning",
  },
  complimentary: {
    label: "Complimentary membership",
    icon: Gift,
    tone: "positive",
  },
  expired: { label: "Expired", icon: XCircle, tone: "neutral" },
  pending_reconciliation: {
    label: "Activating…",
    icon: Loader2,
    tone: "neutral",
  },
};

const TONE_CLASSES: Record<"positive" | "warning" | "neutral", string> = {
  // orangeText, not orange — plain orange fails 4.5:1 as text on this
  // card's background (axe-flagged; see tailwind.config.js).
  positive: "text-voicesNext-orangeText",
  warning: "text-voicesNext-orangeText",
  neutral: "text-voicesNext-cream/70",
};

export default function MembershipStatusCard({
  state,
}: {
  state: MembershipState;
}) {
  // Left at the payment step. No spinner, no "Manage membership": say what
  // happened (nothing was charged) and offer the one thing they can do.
  const resumable = getResumableCheckout(state);
  if (resumable) {
    return (
      <div className={accountSurfaceClassName} data-testid="unfinished-checkout">
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          Finish joining Voices
        </h2>
        <p className="mt-2 max-w-md font-gabarito text-sm text-voicesNext-cream/90">
          You chose{" "}
          <strong>
            {formatMinorUnitsWithCadence(
              resumable.amountMinor,
              state.currency ?? "gbp",
              resumable.cadence,
            )}
          </strong>{" "}
          but didn&rsquo;t complete payment. Nothing has been charged &mdash;
          pick up where you left off.
        </p>
        <Link
          href={resumable.href}
          className={cn(
            accountPrimaryButtonClassName,
            "mt-4 h-11 px-5 text-sm",
          )}
        >
          Finish joining
        </Link>
      </div>
    );
  }

  if (!state.status) {
    return (
      <div className={accountSurfaceClassName}>
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          You&rsquo;re not a member yet
        </h2>
        <p className="mt-2 max-w-md font-gabarito text-sm text-voicesNext-cream/90">
          Join Voices to unlock member benefits and help keep the station on
          air.
        </p>
        <Link
          href="/join"
          className={cn(
            accountPrimaryButtonClassName,
            "mt-4 h-11 px-5 text-sm",
          )}
        >
          Join Voices
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[state.status];
  const Icon = meta.icon;
  const renewsAt = formatMembershipDate(state.renewsAt);
  const paidThroughAt = formatMembershipDate(state.paidThroughAt);

  return (
    <div className={accountSurfaceClassName}>
      {state.isFoundingMember && (
        <p className="mb-3 inline-flex w-fit items-center rounded-full bg-voicesNext-orangeButton px-3 py-1 font-asap text-[11px] font-bold uppercase tracking-[1px] text-white">
          Founding member · Voices · 2026
        </p>
      )}

      <div
        className={cn(
          "flex items-center gap-2 font-gabarito text-sm font-bold uppercase tracking-wide",
          TONE_CLASSES[meta.tone],
        )}
      >
        <Icon
          aria-hidden="true"
          size={18}
          className={
            state.status === "pending_reconciliation"
              ? "animate-spin"
              : undefined
          }
        />
        <span>{meta.label}</span>
      </div>

      <h2 className="mt-2 font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        {state.priceMinor !== null && state.currency && state.cadence
          ? formatMinorUnitsWithCadence(
              state.priceMinor,
              state.currency,
              state.cadence,
            )
          : "Voices Membership"}
      </h2>

      {state.status === "cancelling" && paidThroughAt && (
        <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/90">
          Your benefits stay active through <strong>{paidThroughAt}</strong>.
        </p>
      )}

      {state.status === "active" && renewsAt && (
        <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/90">
          Renews {renewsAt}.
        </p>
      )}

      {state.paymentIssue && (
        <p className="mt-3 font-gabarito text-sm text-voicesNext-orangeText">
          There&rsquo;s a problem with your last payment.{" "}
          {state.paymentIssue.gracePeriodEndsAt &&
            `Please update your payment method by ${formatMembershipDate(
              state.paymentIssue.gracePeriodEndsAt,
            )}.`}
        </p>
      )}

      {state.scheduledChange && (
        <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/70">
          {state.scheduledChange.type === "downgrade"
            ? `Reducing your contribution on ${formatMembershipDate(
                state.scheduledChange.effectiveAt,
              )}.`
            : `Switching billing cadence on ${formatMembershipDate(
                state.scheduledChange.effectiveAt,
              )}.`}
        </p>
      )}

      {/* Exactly one primary action, per state — never more than one call to action. */}
      <div className="mt-5">
        {state.status === "pending_reconciliation" ? (
          <p className="font-gabarito text-sm text-voicesNext-cream/70">
            Your payment is being confirmed. This usually takes a few seconds
            &mdash; refresh in a moment.
          </p>
        ) : state.status === "grace" ? (
          <Link
            href="/account/membership"
            className={cn(accountPrimaryButtonClassName, "h-11 px-5 text-sm")}
          >
            Fix payment method
          </Link>
        ) : state.status === "expired" ? (
          <Link
            href="/join"
            className={cn(accountPrimaryButtonClassName, "h-11 px-5 text-sm")}
          >
            Rejoin Voices
          </Link>
        ) : (
          <Link
            href="/account/membership"
            className={cn(accountSecondaryButtonClassName, "h-11 px-5 text-sm")}
          >
            Manage membership
          </Link>
        )}
      </div>
    </div>
  );
}
