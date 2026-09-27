import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/voices/membership/session";
import { startCheckout } from "@/lib/voices/membership/start-checkout";
import { parseAmountMinor } from "@/lib/voices/membership/types";

/**
 * Checkout handoff for a visitor who is already signed in and has picked a
 * contribution amount on /join (the create-account flow handles the
 * brand-new-member case instead — see join/create-account/actions.ts). A
 * GET, not a Server Action, so contribution-summary.tsx's "Continue" CTA
 * can stay a plain <Link>.
 */
export async function GET(request: NextRequest) {
  const amount = request.nextUrl.searchParams.get("amount") ?? undefined;
  const cadence = request.nextUrl.searchParams.get("cadence") ?? undefined;
  // Encode: these are raw query params, and interpolating them unescaped lets
  // a crafted `amount` inject extra params into the path we hand to requireSession.
  const returnTo = `/join/checkout?amount=${encodeURIComponent(
    amount ?? "",
  )}&cadence=${encodeURIComponent(cadence ?? "")}`;

  await requireSession(returnTo);

  const failure = await startCheckout(parseAmountMinor(amount), cadence);
  redirect(`/join?checkoutError=${encodeURIComponent(failure.message)}`);
}
