import type { Metadata } from "next";
import Link from "next/link";
import {
  AccountPageIntro,
  AccountSurface,
} from "../account/components/account-surface";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Reset your password",
  description: "Request a password reset for your Voices account.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;

  return (
    <div className="mx-auto max-w-[620px] px-4 py-12 md:px-8 md:py-16">
      <AccountPageIntro
        eyebrow="Voices account"
        title="Reset your password"
        description="Enter the email on your Voices account and we'll send you a password reset link."
      />

      <AccountSurface className="mt-6">
        <ForgotPasswordForm email={email ?? ""} next={next ?? ""} />
      </AccountSurface>

      <p className="mt-6 font-gabarito text-sm text-voicesNext-cream/70">
        Remembered it?{" "}
        <Link
          href={`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-voicesNext-cream underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
