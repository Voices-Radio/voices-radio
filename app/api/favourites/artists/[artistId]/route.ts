import { NextRequest, NextResponse } from "next/server";
import {
  saveArtist,
  unsaveArtist,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

type RouteContext = { params: Promise<{ artistId: string }> };

/** Thin BFF proxy for PUT /api/favourites/artists/:artistId — heart an artist. */
export async function PUT(_request: NextRequest, { params }: RouteContext) {
  const { artistId } = await params;
  const result = await saveArtist(artistId);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}

/** Thin BFF proxy for DELETE /api/favourites/artists/:artistId — un-heart. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { artistId } = await params;
  const result = await unsaveArtist(artistId);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}
