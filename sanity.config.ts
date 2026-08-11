import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { env } from "./env";
import { pageStructure, singletonPlugin } from "./plugins/settings";
import aboutType from "./schemas/about";
import blogType from "./schemas/blog";
import mainBlogType from "./schemas/mainBlog";
import homeType from "./schemas/home";
import homePageType, { homeShowSelectionType } from "./schemas/homePage";
import partnerType from "./schemas/partner";
import settingsType from "./schemas/settings";
import podcastType from "./schemas/podcast";
import servicesType from "./schemas/services";
import eventType from "./schemas/event";
import membershipPageType from "./schemas/membershipPage";
import membershipTierType from "./schemas/membershipTier";
import membershipBenefitType from "./schemas/membershipBenefit";

const schemaTypes = [
  settingsType,
  partnerType,
  homeShowSelectionType,
  homePageType,
  homeType,
  aboutType,
  podcastType,
  servicesType,
  blogType,
  mainBlogType,
  eventType,
  membershipPageType,
  membershipTierType,
  membershipBenefitType,
];

export default defineConfig({
  basePath: "/studio",
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  title: "Studio",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  schema: { types: schemaTypes },
  plugins: [
    deskTool({
      structure: pageStructure([
        settingsType,
        homePageType,
        homeType,
        aboutType,
        podcastType,
        servicesType,
        membershipPageType,
      ]),
    }),
    visionTool({}),
    singletonPlugin([
      settingsType.name,
      homePageType.name,
      homeType.name,
      aboutType.name,
      podcastType.name,
      servicesType.name,
      membershipPageType.name,
    ]),
  ],
});
