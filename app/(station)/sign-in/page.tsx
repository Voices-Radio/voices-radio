import type { Metadata } from "next";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Sign in",
  description: "Sign in to manage your Voices Radio membership.",
};

export default async function SignInPage({
  searchParams,
}: {
  // `?as=artist|member` from older links is deliberately ignored: there is
  // one sign-in, and where it lands depends on what the account holds.
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <SignInForm next={next ?? ""} />;
}
