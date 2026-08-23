import type { Metadata } from "next";
import {
  getBenefits,
  getProfile,
} from "@/lib/voices/membership/membership-client";
import {
  AccountPageIntro,
  AccountSurface,
} from "../components/account-surface";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
  title: "Your profile",
};

export default async function AccountProfilePage() {
  const [profileResult, benefitsResult] = await Promise.all([
    getProfile(),
    getBenefits(),
  ]);

  if (!profileResult.ok) {
    return (
      <AccountSurface
        role="alert"
        interactive={false}
        className="font-gabarito text-sm text-voicesNext-cream/90"
      >
        {profileResult.message}
      </AccountSurface>
    );
  }

  // Only prompt for a postal address when it's actually needed to fulfil a
  // benefit on the member's current tier (contract §9) — never by default.
  const showAddress =
    benefitsResult.ok &&
    benefitsResult.data.some((benefit) => benefit.requiresAddress);

  return (
    <div>
      <AccountPageIntro
        eyebrow="Member desk"
        title="Your profile"
        description="Set the details used for member recognition and benefit fulfilment."
      />
      <div className="mt-6">
        <ProfileForm profile={profileResult.data} showAddress={showAddress} />
      </div>
    </div>
  );
}
