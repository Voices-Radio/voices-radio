import { NextRequest, NextResponse } from "next/server";
import {
  fetchFavourites,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

/**
 * Thin BFF proxy for GET /api/favourites — paginated favourites, filtered
 * to one list via ?listId=. Backs the "load more" on /account/favourites;
 * the page's own initial render reads getFavourites() directly (see
 * lib/voices/favourites/client.ts), same split as app/api/membership/me.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("listId") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;

  const result = await fetchFavourites({ listId, cursor });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}
