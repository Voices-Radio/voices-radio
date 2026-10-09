/**
 * Single cache tag for every Sanity read. Content documents reference each
 * other (homePage → shows/blog, blog → benefits…), so per-type tags would miss
 * pages that embed a changed document. At this publishing volume, expiring all
 * Sanity reads together is simpler and always correct.
 */
export const SANITY_CACHE_TAG = "sanity";

/** TTL safety net if the publish webhook is missing or misconfigured. */
export const SANITY_REVALIDATE_SECONDS = 300;
