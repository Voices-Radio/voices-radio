import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { pageStructure, singletonPlugin } from "./plugins/settings";
import { apiVersion, dataset, projectId } from "./sanity.env";
import settingsType from "./schemas/settings";

export const PREVIEWABLE_DOCUMENT_TYPES: string[] = [settingsType.name];

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [settingsType],
  },
  plugins: [
    deskTool({ structure: pageStructure([settingsType]) }),
    singletonPlugin([settingsType.name]),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
