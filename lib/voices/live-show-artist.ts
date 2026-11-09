import { VOICES_API_BASE_URL } from "./config";

const MATCH_TIMEOUT_MS = 2_000;

type MatchResponse = { artist?: { imageUrl?: unknown } | null };

/**
 * Profile photo of the one artist the backend matches exactly to a live show
 * title (GET /api/artists/match-show), else undefined. Never throws: the photo
 * is optional and must not cost the live title. Airtime only — RadioCult
 * events carry their artists, so this goes once KX moves there.
 */
export async function fetchLiveShowArtistImage(
  title: string,
): Promise<string | undefined> {
  try {
    const url = new URL("/api/artists/match-show", VOICES_API_BASE_URL);
    url.searchParams.set("title", title);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(MATCH_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;

    const { artist } = (await response.json()) as MatchResponse;
    const imageUrl = artist?.imageUrl;
    return typeof imageUrl === "string" && imageUrl ? imageUrl : undefined;
  } catch {
    return undefined;
  }
}
