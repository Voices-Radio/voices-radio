import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/voices/membership/session";

export async function POST() {
  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
