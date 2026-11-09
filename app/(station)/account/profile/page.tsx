import type { Metadata } from "next";
import {
  getBenefits,
  getProfile,
} from "@/lib/voices/membership/membership-client";
import {
  AccountPageIntro,
  AccountSurface,
} from "../components/account-surface";
import { hasCapability } from "@/lib/voices/membership/capabilities";
import { getCapabilities } from "@/lib/voices/membership/session";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your profile",
};

export default async function AccountProfilePage() {
  const [profileResult, benefitsResult, capabilities] = await Promise.all([
    getProfile(),
    getBenefits(),
    getCapabilities(),
  ]);

  // Only a confirmed non-member gets the trimmed-down form: if the capabilities
  // lookup is down we show the full one rather than hide a member's settings.
  const freeAccount = capabilities !== null && !hasCapability(capabilities, "member");

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
  // benefit the member has access to (contract §9) — never by default.
  const showAddress =
    benefitsResult.ok &&
    benefitsResult.data.some((benefit) => benefit.requiresAddress);

  return (
    <div>
      <AccountPageIntro
        eyebrow={freeAccount ? "Account desk" : "Member desk"}
        title="Your profile"
        description={
          freeAccount
            ? "Choose how Voices contacts you."
            : "Set the details used for member recognition and benefit fulfilment."
        }
      />
      <div className="mt-6">
        <ProfileForm
          profile={profileResult.data}
          showAddress={showAddress}
          freeAccount={freeAccount}
        />
      </div>
    </div>
  );
}
