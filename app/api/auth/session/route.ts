import { NextResponse } from "next/server";
import { getSession } from "@/lib/voices/membership/session";

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
