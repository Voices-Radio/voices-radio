import type { Metadata } from "next";
import ResendVerification from "../verify-email/resend-verification";
import {
  AccountPageIntro,
  AccountSurface,
} from "../account/components/account-surface";
import CreatePasswordForm from "./create-password-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Create your password",
  description: "Confirm your email and create a password for your Voices account.",
  // The address bar carries a single-use token; keep it out of Referer headers
  // sent to anything this page loads.
  referrer: "no-referrer",
};

/**
 * Where the "confirm your email and create your password" email lands.
 *
 * Rendering this page does NOT spend the token (mail scanners open links before
 * people do); it is only spent when the form is submitted. Choosing the password
 * is what proves the inbox, since the link only ever reached it.
 */
export default async function CreatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
      {token ? (
        <>
          <AccountPageIntro
            eyebrow="Your Voices membership"
            title="Create your password"
            description="You're nearly done. Choose a password and your email is confirmed, your account is ready, and we'll take you straight in."
          />
          <AccountSurface className="mt-6">
            <CreatePasswordForm token={token} />
          </AccountSurface>
        </>
      ) : (
        <>
          <AccountPageIntro
            eyebrow="Your Voices membership"
            title="Link unavailable"
            description="This link is missing its code. Open it again from your email, or get a new one."
          />
          <div className="mt-8">
            <ResendVerification next="/account" />
          </div>
        </>
      )}
    </div>
  );
}
