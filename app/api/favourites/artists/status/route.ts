import { NextRequest, NextResponse } from "next/server";
import {
  getArtistFavouritesStatus,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

/**
 * Thin BFF proxy for GET /api/favourites/artists/status?artistIds=a,b,c —
 * bulk hearted-state for a page of artist cards. Called from
 * favourites-context.tsx so a grid of cards makes one request, not one each.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistIds = (searchParams.get("artistIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const result = await getArtistFavouritesStatus(artistIds);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json({ statuses: result.data });
}
