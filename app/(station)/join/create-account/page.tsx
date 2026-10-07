import type { Metadata } from "next";
import CreateAccountForm from "./create-account-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Create your account",
  description: "Create a Voices Radio account to become a member.",
};

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; cadence?: string }>;
}) {
  const { amount, cadence } = await searchParams;

  return (
    <CreateAccountForm amount={amount ?? ""} cadence={cadence ?? "monthly"} />
  );
}
