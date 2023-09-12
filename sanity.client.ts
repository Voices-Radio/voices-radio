import { createClient } from "next-sanity";
import { env } from "./env";
import {
  About,
  Home,
  Partner,
  Settings,
  aboutQuery,
  homeQuery,
  partnersQuery,
  settingsQuery,
} from "./sanity.queries";

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-06-21",
  /**
   * @note If you set this to true the client will fetch content from our cache delivery network. In this case, however, we will not generate a whole lot of API traffic, and we want updates to be instantly available, so set this to false
   */
  useCdn: false,
  studioUrl: "/",
  fetch: { next: { revalidate: 0 } },
});

export const getSettings = () => client.fetch<Settings>(settingsQuery);

export const getPartners = () => client.fetch<Partner[]>(partnersQuery);

export const getHome = () => client.fetch<Home>(homeQuery);

export const getAbout = () => client.fetch<About>(aboutQuery);
