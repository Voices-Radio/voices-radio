"use client";

import { useRouter } from "next/navigation";
import ConfirmChangeDialog from "../../components/membership/confirm-change-dialog";
import { trackMembershipEvent } from "@/lib/voices/membership/analytics";
import {
  changeCadenceAction,
  downgradeAction,
  previewChangeAction,
  upgradeAction,
} from "./actions";
import type { MembershipCadence } from "@/lib/voices/membership/types";
import { formatMinorUnits } from "@/lib/voices/membership/format";
import { accountSecondaryButtonClassName } from "../components/account-surface";
import { cn } from "@/lib/utils";

interface OtherTier {
  id: string;
  name: string;
  priceMinor: number;
  direction: "upgrade" | "downgrade";
}

export function PlanSwitcher({
  otherTiers,
  currency,
  cadence,
}: {
  otherTiers: OtherTier[];
  currency: string;
  cadence: MembershipCadence;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      {otherTiers.map((tier) => (
        <div
          key={tier.id}
          className="flex items-center justify-between gap-4 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-voicesNext-orange/70 hover:bg-voicesNext-surface motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div>
            <p className="font-gabarito text-sm font-bold text-voicesNext-cream">
              {tier.name}
            </p>
            <p className="font-gabarito text-xs text-voicesNext-cream/70">
              {formatMinorUnits(tier.priceMinor, currency)}/
              {cadence === "monthly" ? "month" : "year"}
            </p>
          </div>
          <ConfirmChangeDialog
            triggerLabel={
              tier.direction === "upgrade" ? "Upgrade" : "Downgrade"
            }
            triggerClassName={cn(
              accountSecondaryButtonClassName,
              "h-10 px-4 text-sm",
            )}
            title={`${
              tier.direction === "upgrade" ? "Upgrade" : "Downgrade"
            } to ${tier.name}`}
            currency={currency}
            loadPreview={() =>
              previewChangeAction({ action: tier.direction, toTierId: tier.id })
            }
            confirmLabel={`Confirm ${
              tier.direction === "upgrade" ? "upgrade" : "downgrade"
            }`}
            onConfirm={async () => {
              const result =
                tier.direction === "upgrade"
                  ? await upgradeAction(tier.id)
                  : await downgradeAction(tier.id);
              if (result.ok) {
                trackMembershipEvent(
                  tier.direction === "upgrade"
                    ? { name: "membership_upgraded", tierId: tier.id }
                    : {
                        name: "membership_downgrade_scheduled",
                        tierId: tier.id,
                      },
                );
              }
              return result;
            }}
            onSuccess={() => router.refresh()}
          />
        </div>
      ))}
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
