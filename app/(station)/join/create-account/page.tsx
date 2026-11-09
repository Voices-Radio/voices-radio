import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { parseAmountMinor, parseMembershipCadence } from "@/lib/voices/membership/types";
import { safeAccountNextPath } from "@/lib/voices/membership/capabilities";
import CreateAccountForm from "./create-account-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your details",
  description: "Tell us who you are before paying for your Voices membership.",
};

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; cadence?: string; next?: string }>;
}) {
  const { amount, cadence, next } = await searchParams;

  // Payment comes straight after this step, so an amount is required. Without
  // one (an old bookmark, a hand-typed URL) send them to choose first.
  if (!parseAmountMinor(amount)) redirect("/join");

  return (
    <CreateAccountForm
      amount={amount ?? ""}
      cadence={parseMembershipCadence(cadence)}
      next={safeAccountNextPath(next)}
    />
  );
}
