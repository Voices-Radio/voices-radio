import { NextRequest, NextResponse } from "next/server";
import {
  getFavouritesStatus,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

/**
 * Thin BFF proxy for GET /api/favourites/status?showIds=a,b,c — bulk
 * saved-state for a page of show cards. Called from
 * favourites-context.tsx so a grid of 30 cards makes one request, not 30.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("showIds") ?? "";
  const showIds = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const result = await getFavouritesStatus(showIds);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json({ statuses: result.data });
}
