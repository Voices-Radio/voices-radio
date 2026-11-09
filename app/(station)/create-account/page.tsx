import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/voices/membership/session";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import FreeAccountForm from "./create-account-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Create a free account",
  description:
    "Create a free Voices account to save your favourite artists and shows.",
};

export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = safeInternalPathOrUndefined(next);

  // Already signed in: nothing to create.
  if (await getSession()) redirect(safeNext ?? "/account");

  return <FreeAccountForm next={safeNext ?? ""} />;
}
