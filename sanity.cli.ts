/* eslint-disable no-process-env */
import { loadEnvConfig } from "@next/env";
import { defineCliConfig } from "sanity/cli";
import { env } from "./env";

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(__dirname, dev, { info: () => null, error: console.error });

export default defineCliConfig({
  api: {
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
