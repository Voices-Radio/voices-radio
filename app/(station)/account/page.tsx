import Link from "next/link";
import type { Metadata } from "next";
import {
  getBenefits,
  getMembership,
  getTiers,
} from "@/lib/voices/membership/membership-client";
import { getSession } from "@/lib/voices/membership/session";
import MembershipStatusCard from "../components/membership/membership-status-card";

export const metadata: Metadata = {
  title: "Your account",
};

const USABLE_BENEFIT_STATES = new Set(["available", "requires_action"]);

export default async function AccountPage() {
  const [user, membershipResult, tiersResult, benefitsResult] =
    await Promise.all([
      getSession(),
      getMembership(),
      getTiers(),
      getBenefits(),
    ]);

  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        {user?.firstName ? `Hi ${user.firstName}` : "Your account"}
      </h1>

      <div className="mt-6">
        {membershipResult.ok ? (
          <MembershipStatusCard
            state={membershipResult.data}
            tierName={
              tiersResult.ok
                ? (tiersResult.data.find(
                    (tier) => tier.id === membershipResult.data.tierId,
                  )?.name ?? null)
                : null
            }
          />
        ) : (
          <div
            role="alert"
            className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 font-gabarito text-sm text-voicesNext-cream/90"
          >
            {membershipResult.message}
          </div>
        )}
      </div>

      {benefitsResult.ok && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
              Ready to use
            </h2>
            <Link
              href="/account/benefits"
              className="font-gabarito text-sm font-bold text-voicesNext-cream/70 underline underline-offset-2 hover:text-voicesNext-orange"
            >
              View all benefits
            </Link>
          </div>

          {(() => {
            const usable = benefitsResult.data.filter((benefit) =>
              USABLE_BENEFIT_STATES.has(benefit.state),
            );
            return usable.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2">
                {usable.map((benefit) => (
                  <li key={benefit.id}>
                    <Link
                      href={`/benefits/${benefit.slug}`}
                      className="flex items-center justify-between rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-gabarito text-sm text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange"
                    >
                      {benefit.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-gabarito text-sm text-voicesNext-cream/70">
                Nothing waiting on you right now.
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}
