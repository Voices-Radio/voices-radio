import type { Metadata } from "next";
import { parseAccountIntent } from "@/lib/voices/membership/capabilities";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Sign in",
  description: "Sign in to manage your Voices Radio membership.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; as?: string }>;
}) {
  const { next, as } = await searchParams;

  return <SignInForm next={next ?? ""} intent={parseAccountIntent(as)} />;
}
