"use server";

import { redirect } from "next/navigation";
import { resumeCheckout } from "@/lib/voices/membership/guest-checkout";

export type ResumeCheckoutState =
  // Bad or expired link: start again from /join.
  | { status: "link_invalid" }
  // They have a full account now: sign in to carry on.
  | { status: "account_exists" }
  // They already paid; the backend has emailed a new set-password link.
  | { status: "setup_pending" }
  // Anything transient: show why and keep the button for a retry.
  | { status: "error"; message: string }
  | undefined;

/**
 * The resume page's one button. A server action (a POST), never a page load:
 * mail scanners open every link in an email, and a GET that started a Stripe
 * session would start them for people who never clicked. Only returns on
 * failure; success redirects to Stripe.
 */
export async function resumeCheckoutAction(
  _prevState: ResumeCheckoutState,
  formData: FormData,
): Promise<ResumeCheckoutState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { status: "link_invalid" };

  const result = await resumeCheckout(token);
  if (!result.ok) {
    if (result.code === "LINK_INVALID") return { status: "link_invalid" };
    if (result.code === "ACCOUNT_EXISTS") return { status: "account_exists" };
    if (result.code === "SETUP_PENDING") return { status: "setup_pending" };
    return { status: "error", message: result.message };
  }

  redirect(result.data.checkoutUrl);
}
