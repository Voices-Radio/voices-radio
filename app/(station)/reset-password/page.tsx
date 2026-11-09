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

function InvalidResetLink({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Voices account"
        title="Reset link unavailable"
        description={message}
      />
      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        Need another link?{" "}
        <Link
          href="/forgot-password"
          className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
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
    return <InvalidResetLink message="This password reset link is missing a token." />;
  }

  const validation = await backendValidatePasswordResetToken(token);

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
