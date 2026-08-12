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
  tierName,
}: {
  state: MembershipState;
  /** Human tier name resolved from GET /api/membership/tiers — state.tierId is only a slug. */
  tierName: string | null;
}) {
  if (!state.status) {
    return (
      <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6">
        <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
          You&rsquo;re not a member yet
        </h2>
        <p className="mt-2 max-w-md font-gabarito text-sm text-voicesNext-cream/90">
          Join Voices to unlock member benefits and help keep the station on
          air.
        </p>
        <Link
          href="/join"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
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
    <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6">
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
        {tierName ?? state.tierId ?? "Membership"}
      </h2>

      {state.priceMinor !== null && state.currency && state.cadence && (
        <p className="mt-1 font-gabarito text-base text-voicesNext-cream/90">
          {formatMinorUnitsWithCadence(
            state.priceMinor,
            state.currency,
            state.cadence,
          )}
        </p>
      )}

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
            `Please update your payment method by ${formatMembershipDate(state.paymentIssue.gracePeriodEndsAt)}.`}
        </p>
      )}

      {state.scheduledChange && (
        <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/70">
          {state.scheduledChange.type === "downgrade"
            ? `Switching to a lower tier on ${formatMembershipDate(state.scheduledChange.effectiveAt)}.`
            : `Switching billing cadence on ${formatMembershipDate(state.scheduledChange.effectiveAt)}.`}
        </p>
      )}

      {/* Exactly one primary action, per state — never more than one call to action. */}
      <div className="mt-5">
        {state.status === "grace" ? (
          <Link
            href="/account/membership"
            className="inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
          >
            Fix payment method
          </Link>
        ) : state.status === "expired" ? (
          <Link
            href="/join"
            className="inline-flex h-11 items-center justify-center rounded-full bg-voicesNext-orangeButton px-5 font-gabarito text-sm font-bold text-white transition-colors hover:bg-voicesNext-cream hover:text-voicesNext-background focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
          >
            Rejoin Voices
          </Link>
        ) : (
          <Link
            href="/account/membership"
            className="inline-flex h-11 items-center justify-center rounded-full border border-voicesNext-border px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-surface"
          >
            Manage membership
          </Link>
        )}
      </div>
    </div>
  );
}
