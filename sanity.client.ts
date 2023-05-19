import { createClient } from "next-sanity";
import { cache } from "react";
import { apiVersion, dataset, projectId, useCdn } from "./sanity.env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
});

// Enable NextJS to cache and dedupe queries
export const clientFetch = cache(client.fetch.bind(client));
