import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { pageStructure, singletonPlugin } from "./plugins/settings";
import { apiVersion, dataset, projectId } from "./sanity.env";
import homeType from "./schemas/home";
import partnerType from "./schemas/partner";
import settingsType from "./schemas/settings";

export default defineConfig({
  basePath: "/studio",
  projectId,
  title: "Studio",
  dataset,
  schema: { types: [settingsType, partnerType, homeType] },
  plugins: [
    deskTool({
      structure: pageStructure([settingsType, homeType]),
    }),
    singletonPlugin([settingsType.name, homeType.name]),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
