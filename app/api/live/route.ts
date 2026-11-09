import { NextResponse } from "next/server";
import type { VoicesLiveStationId } from "@/lib/voices/config";
import { fetchLiveMetadata } from "@/lib/voices/live-source";

export const runtime = "edge";
export const revalidate = 30;

function isStation(value: string | null): value is VoicesLiveStationId {
  return value === "kx" || value === "east";
}

/**
 * Now-playing for a station, from Airtime or RadioCult depending on the
 * station's `liveSource` (see lib/voices/config.ts). /api/radio-cult/live is
 * kept for the RadioCult cut-over but is no longer called by the shell.
 */
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
    return NextResponse.json(await fetchLiveMetadata(station), {
      // One upstream call per window regardless of visitor count.
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Live metadata unavailable", error);
    return NextResponse.json(
      { message: "Live metadata unavailable" },
      { status: 502 },
    );
  }
}
