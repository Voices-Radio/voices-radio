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
          className="flex items-center justify-between rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3"
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
            triggerLabel={tier.direction === "upgrade" ? "Upgrade" : "Downgrade"}
            triggerClassName="inline-flex h-10 items-center justify-center rounded-full border border-voicesNext-border px-4 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange"
            title={`${tier.direction === "upgrade" ? "Upgrade" : "Downgrade"} to ${tier.name}`}
            currency={currency}
            loadPreview={() =>
              previewChangeAction({ action: tier.direction, toTierId: tier.id })
            }
            confirmLabel={`Confirm ${tier.direction === "upgrade" ? "upgrade" : "downgrade"}`}
            onConfirm={async () => {
              const result =
                tier.direction === "upgrade"
                  ? await upgradeAction(tier.id)
                  : await downgradeAction(tier.id);
              if (result.ok) {
                trackMembershipEvent(
                  tier.direction === "upgrade"
                    ? { name: "membership_upgraded", tierId: tier.id }
                    : { name: "membership_downgrade_scheduled", tierId: tier.id },
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
        targetCadence === "annual" ? "Switch to annual billing" : "Switch to monthly billing"
      }
      triggerClassName="inline-flex h-11 items-center justify-center rounded-full border border-voicesNext-border px-5 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange"
      title={targetCadence === "annual" ? "Switch to annual billing" : "Switch to monthly billing"}
      currency={currency}
      loadPreview={() =>
        previewChangeAction({ action: "change_cadence", toCadence: targetCadence })
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
