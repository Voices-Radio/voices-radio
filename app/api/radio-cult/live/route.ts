import { NextResponse } from "next/server";
import { fetchRadioCultLiveMetadata } from "@/lib/voices/radio-cult";
import type { VoicesLiveStationId } from "@/lib/voices/config";

export const runtime = "edge";
export const revalidate = 30;

function isStation(value: string | null): value is VoicesLiveStationId {
  return value === "kx" || value === "east";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");

  if (!isStation(station)) {
    return NextResponse.json(
      { message: "Param 'station' must be 'kx' or 'east'" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await fetchRadioCultLiveMetadata(station));
  } catch {
    return NextResponse.json(
      { message: "Radio Cult live metadata unavailable" },
      { status: 502 },
    );
  }
}
