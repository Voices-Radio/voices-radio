import type { Metadata } from "next";
import { getBenefits } from "@/lib/voices/membership/membership-client";
import BenefitCard from "../../components/membership/benefit-card";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your benefits",
};

export default async function AccountBenefitsPage() {
  const result = await getBenefits();

  return (
    <div>
      <h1 className="font-outfit text-3xl font-black uppercase text-voicesNext-cream">
        Your benefits
      </h1>

      {!result.ok ? (
        <p role="alert" className="mt-4 font-gabarito text-sm text-voicesNext-cream/90">
          {result.message}
        </p>
      ) : result.data.length === 0 ? (
        <p className="mt-4 font-gabarito text-sm text-voicesNext-cream/70">
          No benefits on your current tier yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {result.data.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      )}
    </div>
  );
}
