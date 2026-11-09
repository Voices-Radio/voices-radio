import { VOICES_API_BASE_URL } from "@/lib/voices/config";
import { requireStudioUser } from "@/lib/voices/studio-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getPositiveInteger(
  value: string | null,
  fallback: number,
  max: number,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  return response.json().catch(() => null);
}

export async function GET(request: Request) {
  // Gate BEFORE touching the admin token: this route lends a server-side
  // credential to its caller, so an unauthenticated caller must never get
  // far enough to spend it.
  const unauthorized = await requireStudioUser(request);
  if (unauthorized) return unauthorized;

  const token = process.env.VOICES_API_ADMIN_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "VOICES_API_ADMIN_TOKEN is not configured." },
      { status: 500 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL("/api/shows/admin/search", VOICES_API_BASE_URL);
  const query = incomingUrl.searchParams.get("q")?.trim();
  const page = getPositiveInteger(incomingUrl.searchParams.get("page"), 1, 500);
  const limit = getPositiveInteger(
    incomingUrl.searchParams.get("limit"),
    50,
    100,
  );

  if (query) {
    upstreamUrl.searchParams.set("q", query);
  }
  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error ??
            payload?.message ??
            `Voices show search failed with ${response.status}.`,
        },
        { status: response.status },
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: "Voices show search returned an invalid response." },
        { status: 502 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Voices admin show search proxy error:", error);

    return NextResponse.json(
      { error: "Voices show search is unavailable." },
      { status: 502 },
    );
  }
}
