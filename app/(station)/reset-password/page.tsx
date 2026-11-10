import type { Metadata } from "next";
import Link from "next/link";
import {
  backendValidatePasswordResetToken,
  type BackendAuthResult,
} from "@/lib/voices/membership/auth-client";
import {
  AccountPageIntro,
  AccountSurface,
} from "../account/components/account-surface";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Set new password",
  description: "Set a new password for your Voices account.",
};

function tokenIsValid(result: BackendAuthResult) {
  const payload = result.payload;
  return (
    result.ok &&
    typeof payload === "object" &&
    payload !== null &&
    "valid" in payload &&
    payload.valid === true
  );
}

// The backend marks a spent link with this code. It also marks older links as
// used when it sends a newer one, so the copy covers both cases.
function tokenWasUsed(result: BackendAuthResult) {
  return result.payload?.code === "TOKEN_USED";
}

const linkClassName =
  "font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange";

function InvalidResetLink({
  title = "Reset link unavailable",
  message,
  offerSignIn = false,
}: {
  title?: string;
  message: string;
  offerSignIn?: boolean;
}) {
  return (
    <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Voices account"
        title={title}
        description={message}
      />
      {offerSignIn && (
        <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
          Set a new password already?{" "}
          <Link href="/sign-in" className={linkClassName}>
            Sign in
          </Link>
        </p>
      )}
      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        Need another link?{" "}
        <Link href="/forgot-password" className={linkClassName}>
          Request a new password reset
        </Link>
      </p>
    </div>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token, next } = await searchParams;

  if (!token) {
    return (
      <InvalidResetLink message="This password reset link is missing a token." />
    );
  }

  const validation = await backendValidatePasswordResetToken(token);

  if (tokenWasUsed(validation)) {
    return (
      <InvalidResetLink
        title="Reset link already used"
        message="This link was already used, or a newer link replaced it. If you set a new password, sign in with it."
        offerSignIn
      />
    );
  }

  if (!tokenIsValid(validation)) {
    return (
      <InvalidResetLink
        message={
          validation.payload?.message ||
          "This password reset link is invalid or has expired."
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Voices account"
        title="Set new password"
        description="Choose a new password for your Voices account."
      />

      <AccountSurface className="mt-6">
        <ResetPasswordForm token={token} next={next ?? ""} />
      </AccountSurface>
    </div>
  );
}
