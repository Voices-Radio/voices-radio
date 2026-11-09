import { NextRequest, NextResponse } from "next/server";
import { getGuestCheckoutStatus } from "@/lib/voices/membership/guest-checkout";

/**
 * Same-origin proxy for the payment-first success page's poll. The Stripe
 * session id is the only credential, and the answer is deliberately thin
 * (confirmed or not, Stripe's session state, a masked email).
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Missing session." } },
      { status: 400 },
    );
  }

  const result = await getGuestCheckoutStatus(sessionId);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.code === "NOT_FOUND" ? 404 : 502 },
    );
  }

  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "no-store" },
  });
}
