import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/voices/membership/session";
import { startCheckout } from "@/lib/voices/membership/start-checkout";

/**
 * Checkout handoff for a visitor who is already signed in and picks a tier
 * on /join (the create-account flow handles the brand-new-member case
 * instead — see join/create-account/actions.ts). A GET, not a Server
 * Action, so tier-comparison.tsx's CTAs can stay plain <Link>s.
 */
export async function GET(request: NextRequest) {
  const tierId = request.nextUrl.searchParams.get("tier") ?? undefined;
  const cadence = request.nextUrl.searchParams.get("cadence") ?? undefined;
  // Encode: these are raw query params, and interpolating them unescaped lets
  // a crafted `tier` inject extra params into the path we hand to requireSession.
  const returnTo = `/join/checkout?tier=${encodeURIComponent(
    tierId ?? "",
  )}&cadence=${encodeURIComponent(cadence ?? "")}`;

  await requireSession(returnTo);

  const failure = await startCheckout(tierId, cadence);
  redirect(`/join?checkoutError=${encodeURIComponent(failure.message)}`);
}
