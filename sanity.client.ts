import "server-only";

import { createClient } from "next-sanity";
import { cache } from "react";
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
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  /**
   * @note If you set this to true the client will fetch content from our cache delivery network. In this case, however, we will not generate a whole lot of API traffic, and we want updates to be instantly available, so set this to false
   */
  useCdn: false,
  studioUrl: "/",
});

export const clientFetch = cache(client.fetch.bind(client));

export const getSettings = () => clientFetch<Settings>(settingsQuery);

export const getPartners = () => clientFetch<Partner[]>(partnersQuery);

export const getHome = () => clientFetch<Home>(homeQuery);

export const getAbout = () => clientFetch<About>(aboutQuery);
