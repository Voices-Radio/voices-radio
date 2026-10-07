import type { Metadata } from "next";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import VerifyEmailHandoff from "./verify-email-handoff";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Confirm your email",
  description: "Confirm your email address for your Voices account.",
};

/**
 * Where the verification email lands (the backend builds the link from the
 * URL create-account sent it — see lib/voices/membership/verification-return.ts).
 * `next` is where to carry on once signed in, typically back into checkout.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token, next } = await searchParams;

  return (
    <VerifyEmailHandoff
      token={token ?? ""}
      next={safeInternalPathOrUndefined(next)}
      initialError={token ? undefined : "This link is missing its verification code."}
    />
  );
}
