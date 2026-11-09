import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  saveShowToLists,
  unsaveShow,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

const saveBodySchema = z.object({
  listIds: z.array(z.string()).optional(),
});

/**
 * Thin BFF proxy for PUT /api/favourites/:showId — the save button's main
 * action. An empty/omitted listIds body saves to the caller's default
 * "My Favourites" list; the list picker sheet sends an explicit array.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> },
) {
  const { showId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = saveBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const result = await saveShowToLists(showId, parsed.data.listIds ?? []);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ showId: string }> },
) {
  const { showId } = await params;
  const result = await unsaveShow(showId);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}
