import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SANITY_REVALIDATE_SECRET: z.string().min(1),
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
