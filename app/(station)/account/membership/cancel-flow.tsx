"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmChangeDialog from "../../components/membership/confirm-change-dialog";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import { formatMinorUnits } from "@/lib/voices/membership/format";
import { cn } from "@/lib/utils";
import {
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
} from "../components/account-surface";
import {
  cancelAction,
  downgradeAction,
  previewChangeAction,
  resumeAction,
} from "./actions";

interface RetentionOffer {
  amountMinor: number;
  heading: string;
}

/**
 * Deliberately non-obstructive (brief requirement): the paid-through date
 * is shown up front, and "Reduce contribution" is a genuinely equal-weight
 * peer option next to "Cancel membership" — not a dark-pattern retention
 * flow. There's no lowest tier to switch to anymore, just the scale
 * minimum. After cancelling, Resume has no preview step (the contract has
 * no preview-change action for resume), so it's a plain confirm, not a
 * dialog.
 */
export default function CancelFlow({
  status,
  paidThroughAt,
  currency,
  retentionOffer,
}: {
  status: "active" | "grace" | "cancelling";
  paidThroughAt: string | null;
  currency: string;
  retentionOffer: RetentionOffer | null;
}) {
  const router = useRouter();
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  if (status === "cancelling") {
    return (
      <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-background p-5">
        <p className="font-gabarito text-sm text-voicesNext-cream/90">
          Your membership is cancelling.{" "}
          {paidThroughAt
            ? `Your benefits stay active through ${paidThroughAt}, and you can resume any time before then.`
            : "You can resume any time before your paid-through date passes."}
        </p>
        <button
          type="button"
          disabled={resuming}
          aria-busy={resuming}
          onClick={async () => {
            setResuming(true);
            setResumeError(null);
            const result = await resumeAction();
            setResuming(false);
            if (result.ok) {
              trackMembershipEvent({ name: "membership_resumed" });
              router.refresh();
            } else {
              setResumeError(result.message);
            }
          }}
          className={cn(
            accountPrimaryButtonClassName,
            "mt-4 h-11 px-5 text-sm",
          )}
        >
          {resuming ? "Resuming…" : "Resume membership"}
        </button>
        {resumeError && (
          <p
            role="alert"
            className="mt-2 font-gabarito text-sm text-voicesNext-orange"
          >
            {resumeError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-voices-md border border-voicesNext-border bg-voicesNext-background p-5">
      {paidThroughAt && (
        <p className="font-gabarito text-sm text-voicesNext-cream/90">
          If you cancel, your benefits stay active through{" "}
          <strong>{paidThroughAt}</strong> — you won&rsquo;t lose access
          immediately.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {retentionOffer && (
          <ConfirmChangeDialog
            triggerLabel={
              retentionOffer.heading ||
              `Reduce to ${formatMinorUnits(retentionOffer.amountMinor, currency)}/month`
            }
            triggerClassName={cn(
              accountSecondaryButtonClassName,
              "h-11 flex-1 px-5 text-center text-sm",
            )}
            title="Reduce your contribution"
            currency={currency}
            loadPreview={() =>
              previewChangeAction({
                action: "downgrade",
                toAmountMinor: retentionOffer.amountMinor,
              })
            }
            confirmLabel="Confirm reduction"
            onConfirm={async () => {
              const result = await downgradeAction(retentionOffer.amountMinor);
              if (result.ok) {
                trackMembershipEvent({
                  name: "membership_downgrade_scheduled",
                  amountMinor: retentionOffer.amountMinor,
                });
              }
              return result;
            }}
            onSuccess={() => router.refresh()}
          />
        )}

        <ConfirmChangeDialog
          triggerLabel="Cancel membership"
          triggerClassName={cn(
            accountSecondaryButtonClassName,
            "h-11 flex-1 px-5 text-center text-sm",
          )}
          title="Cancel membership"
          currency={currency}
          loadPreview={() => previewChangeAction({ action: "cancel" })}
          confirmLabel="Confirm cancellation"
          onConfirm={async () => {
            const result = await cancelAction();
            if (result.ok) {
              trackMembershipEvent({ name: "membership_cancelled" });
            }
            return result;
          }}
          onSuccess={() => router.refresh()}
        />
      </div>
    </div>
  );
}
