import Link from "next/link";
import type { Metadata } from "next";
import {
  getMembership,
  getTiers,
} from "@/lib/voices/membership/membership-client";
import { formatMembershipDate } from "@/lib/voices/membership/format";
import MembershipStatusCard from "../../components/membership/membership-status-card";
import { CadenceSwitcher, PlanSwitcher } from "./plan-switcher";
import CancelFlow from "./cancel-flow";
import ManagePaymentButton from "./manage-payment-button";
import {
  AccountPageIntro,
  AccountSurface,
} from "../components/account-surface";

export const metadata: Metadata = {
  title: "Manage your membership",
};

const CANCEL_ELIGIBLE_STATUSES = new Set(["active", "grace", "cancelling"]);

export default async function AccountMembershipPage() {
  const [membershipResult, tiersResult] = await Promise.all([
    getMembership(),
    getTiers(),
  ]);

  if (!membershipResult.ok) {
    return (
      <AccountSurface
        role="alert"
        interactive={false}
        className="font-gabarito text-sm text-voicesNext-cream/90"
      >
        {membershipResult.message}
      </AccountSurface>
    );
  }

  const state = membershipResult.data;
  const tiers = tiersResult.ok ? tiersResult.data : [];
  const currentTier = tiers.find((tier) => tier.id === state.tierId) ?? null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <AccountPageIntro
          eyebrow="Member desk"
          title="Manage your membership"
          description="Review your current pass, change tier, adjust billing, or manage payment details."
        />
        <div className="mt-6">
          <MembershipStatusCard
            state={state}
            tierName={currentTier?.name ?? null}
          />
        </div>
      </div>

      {!state.status && (
        <p className="font-gabarito text-sm text-voicesNext-cream/70">
          Nothing to manage yet —{" "}
          <Link
            href="/join"
            className="font-bold underline underline-offset-2 hover:text-voicesNext-orange"
          >
            join Voices
          </Link>{" "}
          to get started.
        </p>
      )}

      {state.status &&
        currentTier &&
        state.cadence &&
        state.currency &&
        tiers.length > 0 && (
          <>
            {(state.status === "active" || state.status === "grace") && (
              <AccountSurface>
                <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
                  Change tier
                </h2>
                <div className="mt-4">
                  <PlanSwitcher
                    currency={state.currency}
                    cadence={state.cadence}
                    otherTiers={tiers
                      .filter((tier) => tier.id !== state.tierId)
                      .map((tier) => ({
                        id: tier.id,
                        name: tier.name,
                        priceMinor:
                          state.cadence === "annual"
                            ? tier.annualPriceMinor
                            : tier.monthlyPriceMinor,
                        direction:
                          tier.sortOrder > currentTier.sortOrder
                            ? ("upgrade" as const)
                            : ("downgrade" as const),
                      }))}
                  />
                </div>

                <h2 className="mt-8 font-gabarito text-xl font-bold text-voicesNext-cream">
                  Billing cadence
                </h2>
                <div className="mt-4">
                  <CadenceSwitcher
                    currentCadence={state.cadence}
                    currency={state.currency}
                  />
                </div>
              </AccountSurface>
            )}

            <AccountSurface>
              <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
                Payment method
              </h2>
              <div className="mt-4">
                <ManagePaymentButton />
              </div>
            </AccountSurface>

            {CANCEL_ELIGIBLE_STATUSES.has(state.status) && (
              <AccountSurface interactive={false}>
                <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
                  {state.status === "cancelling"
                    ? "Cancellation"
                    : "Cancel or switch down"}
                </h2>
                <div className="mt-4">
                  <CancelFlow
                    status={state.status as "active" | "grace" | "cancelling"}
                    paidThroughAt={formatMembershipDate(state.paidThroughAt)}
                    currency={state.currency}
                    supporterOffer={
                      currentTier.id !== "supporter"
                        ? (() => {
                            const supporter = tiers.find(
                              (tier) => tier.id === "supporter",
                            );
                            return supporter
                              ? {
                                  id: supporter.id,
                                  name: supporter.name,
                                  priceMinor: supporter.monthlyPriceMinor,
                                }
                              : null;
                          })()
                        : null
                    }
                  />
                </div>
              </AccountSurface>
            )}
          </>
        )}
    </div>
  );
}
