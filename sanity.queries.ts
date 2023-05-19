import { groq } from "next-sanity";
import { clientFetch } from "./sanity.client";

export const settingsQuery = groq`*[_type == "settings"][0]`;

interface Settings {
  title?: string;
  description?: string;
}

export const getSettings = () => clientFetch<Settings>(settingsQuery);

export const documentsCountQuery = groq`count(*[])`;

export const getDocumentsCount = () => clientFetch<number>(documentsCountQuery);
