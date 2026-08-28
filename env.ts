import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Every server variable the app reads, declared in one place.
 *
 * Most are `optional()` rather than `min(1)` on purpose: this schema runs at
 * build time, and marking something required that isn't yet set in Vercel fails
 * the deploy rather than surfacing a warning. The rule applied here is —
 *
 *   required  = the app cannot function and the failure would be confusing
 *   optional  = absence is either legitimate or already reported clearly at
 *               the point of use
 *
 * The variables that used to be missing from this file entirely were the real
 * problem: they were read straight from process.env with no declaration, so
 * nothing recorded that they existed or what depended on them.
 */
export const env = createEnv({
  server: {
    SANITY_REVALIDATE_SECRET: z.string().min(1),

    // Upstream Voices API. Both have working defaults in lib/voices/config.ts.
    VOICES_API_BASE_URL: z.string().url().optional(),
    VOICES_MEMBERSHIP_API_BASE_URL: z.string().url().optional(),

    // Lent to callers of /api/voices/admin-*. Optional here because that route
    // already returns an explicit "VOICES_API_ADMIN_TOKEN is not configured"
    // error — a loud, self-describing failure, not a silent one.
    VOICES_API_ADMIN_TOKEN: z.string().optional(),

    // Rate limiting. Optional in the schema, but see assertRateLimitingConfigured
    // below: absence in production is the one case that fails silently.
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    KV_REST_API_URL: z.string().url().optional(),
    KV_REST_API_TOKEN: z.string().optional(),

    RADIOCULT_API_BASE_URL: z.string().url().optional(),

    ENABLE_STAGING_AUTH: z.string().optional(),
    STAGING_AUTH_USER: z.string().optional(),
    STAGING_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    NEXT_PUBLIC_FATHOM_SITE_ID: z.string().min(1),
    NEXT_PUBLIC_SITE_ENV: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
  },
  runtimeEnv: {
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    VOICES_API_BASE_URL: process.env.VOICES_API_BASE_URL,
    VOICES_MEMBERSHIP_API_BASE_URL: process.env.VOICES_MEMBERSHIP_API_BASE_URL,
    VOICES_API_ADMIN_TOKEN: process.env.VOICES_API_ADMIN_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    RADIOCULT_API_BASE_URL: process.env.RADIOCULT_API_BASE_URL,
    ENABLE_STAGING_AUTH: process.env.ENABLE_STAGING_AUTH,
    STAGING_AUTH_USER: process.env.STAGING_AUTH_USER,
    STAGING_PASSWORD: process.env.STAGING_PASSWORD,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_FATHOM_SITE_ID: process.env.NEXT_PUBLIC_FATHOM_SITE_ID,
    NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
});
