import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResumeForm from "./resume-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Finish joining",
  description: "Finish paying for your Voices membership.",
};

/**
 * Where the abandoned-checkout reminder sends a guest joiner. Loading this
 * page does nothing on its own; the visitor's button press starts the
 * checkout (see actions.ts).
 */
export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; amount?: string; cadence?: string }>;
}) {
  const { token, amount, cadence } = await searchParams;

  // No token (a hand-typed or truncated URL): nothing to resume.
  if (!token) redirect("/join");

  return <ResumeForm token={token} amount={amount ?? ""} cadence={cadence ?? ""} />;
}
