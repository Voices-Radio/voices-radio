import type { Metadata } from "next";
import { getBenefits, getProfile } from "@/lib/voices/membership/membership-client";
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
      <div role="alert" className="rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 font-gabarito text-sm text-voicesNext-cream/90">
        {profileResult.message}
      </div>
    );
  }

  // Only prompt for a postal address when it's actually needed to fulfil a
  // benefit on the member's current tier (contract §9) — never by default.
  const showAddress =
    benefitsResult.ok && benefitsResult.data.some((benefit) => benefit.requiresAddress);

  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Your profile
      </h1>
      <div className="mt-6">
        <ProfileForm profile={profileResult.data} showAddress={showAddress} />
      </div>
    </div>
  );
}
