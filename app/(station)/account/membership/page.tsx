import Link from "next/link";
import type { Metadata } from "next";
import {
  getMembership,
  getPlans,
} from "@/lib/voices/membership/membership-client";
import { mergeMembershipScale } from "@/lib/voices/membership/constants";
import {
  formatMembershipDate,
  formatMinorUnits,
} from "@/lib/voices/membership/format";
import MembershipStatusCard from "../../components/membership/membership-status-card";
import { AmountSwitcher, CadenceSwitcher } from "./plan-switcher";
import CancelFlow from "./cancel-flow";
import ManagePaymentButton from "./manage-payment-button";
import {
  AccountPageIntro,
  AccountSurface,
} from "../components/account-surface";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Manage your membership",
};

const CANCEL_ELIGIBLE_STATUSES = new Set(["active", "grace", "cancelling"]);

export default async function AccountMembershipPage() {
  const [membershipResult, plansResult] = await Promise.all([
    getMembership(),
    getPlans(),
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
  const scale = plansResult.ok ? mergeMembershipScale(plansResult.data.scale) : null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <AccountPageIntro
          eyebrow="Member desk"
          title="Manage your membership"
          description="Review your current contribution, adjust the amount or billing, or manage payment details."
        />
        <div className="mt-6">
          <MembershipStatusCard state={state} />
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
        state.cadence &&
        state.currency &&
        state.contributionAmountMinor !== null &&
        scale && (
          <>
            {(state.status === "active" || state.status === "grace") && (
              <AccountSurface>
                {state.cadence === "monthly" && (
                  <>
                    <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
                      Change your contribution
                    </h2>
                    <div className="mt-4">
                      <AmountSwitcher
                        scale={scale}
                        currentAmountMinor={state.contributionAmountMinor}
                        cadence={state.cadence}
                      />
                    </div>
                  </>
                )}

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
                    : "Cancel or reduce"}
                </h2>
                <div className="mt-4">
                  <CancelFlow
                    status={state.status as "active" | "grace" | "cancelling"}
                    paidThroughAt={formatMembershipDate(state.paidThroughAt)}
                    currency={state.currency}
                    retentionOffer={
                      state.cadence === "monthly" &&
                      state.contributionAmountMinor > scale.minMinor
                        ? {
                            amountMinor: scale.minMinor,
                            heading: `Reduce to ${formatMinorUnits(scale.minMinor, scale.currency)}/month`,
                          }
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
