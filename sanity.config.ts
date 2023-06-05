import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { env } from "./env";
import { pageStructure, singletonPlugin } from "./plugins/settings";
import homeType from "./schemas/home";
import partnerType from "./schemas/partner";
import settingsType from "./schemas/settings";

export default defineConfig({
  basePath: "/studio",
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  title: "Studio",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  schema: { types: [settingsType, partnerType, homeType] },
  plugins: [
    deskTool({
      structure: pageStructure([settingsType, homeType]),
    }),
    singletonPlugin([settingsType.name, homeType.name]),
    visionTool({ defaultApiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION }),
  ],
});
