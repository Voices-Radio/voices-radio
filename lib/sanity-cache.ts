/**
 * Single cache tag for every Sanity read. Content documents reference each
 * other (homePage → shows/blog, blog → benefits…), so per-type tags would miss
 * pages that embed a changed document. At this publishing volume, expiring all
 * Sanity reads together is simpler and always correct.
 */
export const SANITY_CACHE_TAG = "sanity";

/**
 * TTL safety net if the publish webhook is missing or misconfigured — the
 * webhook (app/api/revalidate) is what keeps content fresh.
 *
 * Kept long on purpose: each cached query refetches from the uncached Sanity
 * API once per TTL, and that API has a 100k requests/month quota. At 300s,
 * ~10 hot queries × 288 refreshes/day ≈ 3k/day, which overran it (Nov 2026).
 * Cost: an edit in the `staging` dataset (no webhook) can take up to 1h to show.
 */
export const SANITY_REVALIDATE_SECONDS = 3600;
