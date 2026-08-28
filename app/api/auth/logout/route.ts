import { NextRequest, NextResponse } from "next/server";
import {
  authedFetch,
  clearSessionCookies,
} from "@/lib/voices/membership/session";

/**
 * Sign out.
 *
 * Dropping the cookies is what signs this browser out, and it happens no
 * matter what else does or doesn't work — the backend call below is only
 * needed for the `allDevices` case, and a listener stuck in a signed-in
 * shell because the API was unreachable is a worse outcome than a token
 * that ages out on its own.
 *
 * `{ allDevices: true }` additionally asks the backend to stamp
 * `sessionsValidAfter` on the account, which kills every other live session
 * — the remedy for a device the user no longer controls. It is account-wide
 * because these JWTs carry no per-session identity; see the logout handler
 * in voices_backend/routes/auth.js.
 */
export async function POST(request: NextRequest) {
  const allDevices = await wantsAllDevices(request);
  let signedOutEverywhere = false;

  if (allDevices) {
    try {
      const response = await authedFetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allDevices: true }),
      });
      signedOutEverywhere = response.ok;
    } catch (error) {
      console.error("Voices sign-out-everywhere failed:", error);
    }
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true, allDevices: signedOutEverywhere });
}

/** Absent, malformed, or non-JSON bodies all mean "just this device". */
async function wantsAllDevices(request: NextRequest): Promise<boolean> {
  try {
    const body = await request.json();
    return body?.allDevices === true;
  } catch {
    return false;
  }
}
