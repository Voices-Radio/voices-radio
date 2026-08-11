import type { Metadata } from "next";
import CreateAccountForm from "./create-account-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a Voices Radio account to become a member.",
};

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; cadence?: string }>;
}) {
  const { tier, cadence } = await searchParams;

  return <CreateAccountForm tier={tier ?? ""} cadence={cadence ?? "monthly"} />;
}
