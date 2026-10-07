"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmChangeDialog from "../../components/membership/confirm-change-dialog";
import ContributionSlider from "../../components/membership/contribution-slider";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import {
  changeCadenceAction,
  downgradeAction,
  previewChangeAction,
  upgradeAction,
} from "./actions";
import type {
  MembershipCadence,
  MembershipScaleView,
} from "@/lib/voices/membership/types";
import { formatMinorUnits } from "@/lib/voices/membership/format";
import { accountSecondaryButtonClassName } from "../components/account-surface";
import { cn } from "@/lib/utils";

/**
 * Replaces the old "other tiers" list — there's no ladder to pick from
 * anymore, just an amount to move the slider to. Moving it away from the
 * current amount surfaces a single confirm action for whichever direction
 * that is (contract §5: same-cadence increase is immediate, decrease is
 * scheduled at renewal).
 */
export function AmountSwitcher({
  scale,
  currentAmountMinor,
  cadence,
}: {
  scale: MembershipScaleView;
  currentAmountMinor: number;
  cadence: MembershipCadence;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(currentAmountMinor);
  const direction =
    amount === currentAmountMinor
      ? null
      : amount > currentAmountMinor
        ? ("upgrade" as const)
        : ("downgrade" as const);
  const display = formatMinorUnits(amount, scale.currency);

  return (
    <div className="flex flex-col gap-4">
      <ContributionSlider
        minMinor={scale.minMinor}
        maxMinor={scale.maxMinor}
        stepMinor={scale.stepMinor}
        currency={scale.currency}
        value={amount}
        onChange={setAmount}
      />

      {direction && (
        <ConfirmChangeDialog
          triggerLabel={
            direction === "upgrade"
              ? `Increase to ${display}/month`
              : `Reduce to ${display}/month`
          }
          triggerClassName={cn(
            accountSecondaryButtonClassName,
            "h-11 w-fit px-5 text-sm",
          )}
          title={
            direction === "upgrade"
              ? `Increase to ${display}/month`
              : `Reduce to ${display}/month`
          }
          currency={scale.currency}
          loadPreview={() =>
            previewChangeAction({ action: direction, toAmountMinor: amount })
          }
          confirmLabel={`Confirm ${direction === "upgrade" ? "increase" : "reduction"}`}
          onConfirm={async () => {
            const result =
              direction === "upgrade"
                ? await upgradeAction(amount)
                : await downgradeAction(amount);
            if (result.ok) {
              trackMembershipEvent(
                direction === "upgrade"
                  ? { name: "membership_upgraded", amountMinor: amount }
                  : {
                      name: "membership_downgrade_scheduled",
                      amountMinor: amount,
                    },
              );
            }
            return result;
          }}
          onSuccess={() => {
            router.refresh();
            setAmount(currentAmountMinor);
          }}
        />
      )}
    </div>
  );
}

export function CadenceSwitcher({
  currentCadence,
  currency,
}: {
  currentCadence: MembershipCadence;
  currency: string;
}) {
  const router = useRouter();
  const targetCadence: MembershipCadence =
    currentCadence === "monthly" ? "annual" : "monthly";

  return (
    <ConfirmChangeDialog
      triggerLabel={
        targetCadence === "annual"
          ? "Switch to annual billing"
          : "Switch to monthly billing"
      }
      triggerClassName={cn(
        accountSecondaryButtonClassName,
        "h-11 px-5 text-sm",
      )}
      title={
        targetCadence === "annual"
          ? "Switch to annual billing"
          : "Switch to monthly billing"
      }
      currency={currency}
      loadPreview={() =>
        previewChangeAction({
          action: "change_cadence",
          toCadence: targetCadence,
        })
      }
      confirmLabel="Confirm change"
      onConfirm={async () => {
        const result = await changeCadenceAction(targetCadence);
        if (result.ok) {
          trackMembershipEvent({
            name: "membership_cadence_changed",
            cadence: targetCadence,
          });
        }
        return result;
      }}
      onSuccess={() => router.refresh()}
    />
  );
}
