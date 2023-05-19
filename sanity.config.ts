import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { apiVersion, dataset, projectId } from "./sanity.env";
import settingsType from "./schemas/settings";
import { settingsPlugin, settingsStructure } from "./plugins/settings";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [settingsType],
  },
  plugins: [
    deskTool({ structure: settingsStructure(settingsType) }),
    settingsPlugin({ type: settingsType.name }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
