import "server-only";

import { createClient } from "next-sanity";
import { cache } from "react";
import { apiVersion, dataset, projectId, useCdn } from "./sanity.env";
import {
  Partner,
  Settings,
  settingsQuery,
  partnersQuery,
} from "./sanity.queries";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  studioUrl: "/",
});

export const clientFetch = cache(client.fetch.bind(client));

export const getSettings = () => clientFetch<Settings>(settingsQuery);

export const getPartners = () => clientFetch<Partner[]>(partnersQuery);
