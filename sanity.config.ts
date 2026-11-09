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
import membershipBenefitType from "./schemas/membershipBenefit";
import membershipTransactionalEmailType from "./schemas/membershipTransactionalEmail";
import listingPagesType from "./schemas/listingPages";
import collaboratePageType from "./schemas/collaboratePage";
import locationPageType from "./schemas/locationPage";

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
  membershipBenefitType,
  membershipTransactionalEmailType,
  listingPagesType,
  collaboratePageType,
  locationPageType,
];

export default defineConfig({
  basePath: "/studio",
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  title: "Studio",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  // This Studio is embedded on our own domain, so the api.sanity.io session is
  // a third-party cookie. The default "dual" method prefers that cookie and
  // leaves the Studio client with no token, which the custom inputs need to
  // call our gated /api/voices/admin-* routes (see schemas/inputs/
  // studio-auth-headers.ts). "token" keeps the session cookieless, so a token
  // is always stored and always sent.
  auth: { loginMethod: "token" },
  schema: { types: schemaTypes },
  plugins: [
    deskTool({
      // "Home - LEGACY" stays registered (the live site still reads it) but
      // has no place in this studio's desk.
      structure: pageStructure(
        [
          homePageType,
          listingPagesType,
          collaboratePageType,
          membershipPageType,
          aboutType,
          servicesType,
          podcastType,
          settingsType,
        ],
        [homeType.name],
      ),
    }),
    visionTool({}),
    singletonPlugin([
      settingsType.name,
      homePageType.name,
      listingPagesType.name,
      collaboratePageType.name,
      homeType.name,
      aboutType.name,
      podcastType.name,
      servicesType.name,
      membershipPageType.name,
    ]),
  ],
});
