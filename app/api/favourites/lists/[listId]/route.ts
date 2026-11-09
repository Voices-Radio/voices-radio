import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  renameFavouriteList,
  deleteFavouriteList,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

const renameBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

/** Thin BFF proxy for PATCH /api/favourites/lists/:listId — rename. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = renameBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "A list name is required and must be 60 characters or fewer" },
      { status: 400 },
    );
  }

  const result = await renameFavouriteList(listId, parsed.data.name);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json({ list: result.data });
}

/** Thin BFF proxy for DELETE /api/favourites/lists/:listId. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const { listId } = await params;
  const result = await deleteFavouriteList(listId);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json(result.data);
}
