import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchFavouriteLists,
  createFavouriteList,
  statusForFavouritesError,
} from "@/lib/voices/favourites/client";

const createListBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

/** Thin BFF proxy for GET /api/favourites/lists — powers the save sheet. */
export async function GET() {
  const result = await fetchFavouriteLists();

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json({ lists: result.data });
}

/** Thin BFF proxy for POST /api/favourites/lists — "+ New list" in the save sheet. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createListBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "A list name is required and must be 60 characters or fewer" },
      { status: 400 },
    );
  }

  const result = await createFavouriteList(parsed.data.name);

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForFavouritesError(result.code) },
    );
  }

  return NextResponse.json({ list: result.data }, { status: 201 });
}
