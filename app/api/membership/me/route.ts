import { NextResponse } from "next/server";
import { getMembership } from "@/lib/voices/membership/membership-client";

/**
 * Thin BFF proxy for GET /api/membership/me, so the client-side reconciliation
 * poller on /join/complete (which can't read the httpOnly session cookie
 * itself) has something same-origin to poll. Server Components use
 * getMembership() directly; this route exists only for client code.
 */
export async function GET() {
  const result = await getMembership();

  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.code === "NO_SESSION" ? 401 : 502 },
    );
  }

  return NextResponse.json(result.data);
}
