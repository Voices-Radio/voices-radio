import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { pageStructure, singletonPlugin } from "./plugins/settings";
import { apiVersion, dataset, projectId } from "./sanity.env";
import settingsType from "./schemas/settings";
import partnerType from "./schemas/partner";

export default defineConfig({
  basePath: "/studio",
  projectId,
  title: "Studio",
  dataset,
  schema: { types: [settingsType, partnerType] },
  plugins: [
    deskTool({ structure: pageStructure([settingsType]) }),
    singletonPlugin([settingsType.name]),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
