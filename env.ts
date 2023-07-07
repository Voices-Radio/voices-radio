import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SANITY_REVALIDATE_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    NEXT_PUBLIC_SANITY_API_VERSION: z.string().min(1),
    NEXT_PUBLIC_FATHOM_URL: z.string().min(1),
    NEXT_PUBLIC_FATHOM_SITE_ID: z.string().min(1),
  },
  runtimeEnv: {
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_FATHOM_URL: process.env.NEXT_PUBLIC_FATHOM_URL,
    NEXT_PUBLIC_FATHOM_SITE_ID: process.env.NEXT_PUBLIC_FATHOM_SITE_ID,
  },
});
