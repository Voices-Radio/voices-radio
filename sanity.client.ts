import { createClient } from "next-sanity";
import { env } from "./env";
import {
  About,
  Home,
  Podcast,
  Partner,
  Settings,
  Services,
  BlogPost,
  aboutQuery,
  servicesQuery,
  homeQuery,
  podcastQuery,
  partnersQuery,
  settingsQuery,
  blogPostsQuery,
  blogPostQuery,
  featuredBlogPostsQuery,
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

// Helper function to handle Sanity fetch errors
const safeFetch = async <T>(query: string, params?: any): Promise<T | null> => {
  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
};

export const getSettings = () => safeFetch<Settings>(settingsQuery);

export const getPartners = () => safeFetch<Partner[]>(partnersQuery);

export const getHome = () => safeFetch<Home>(homeQuery);

export const getAbout = () => safeFetch<About>(aboutQuery);

export const getPodcast = () => safeFetch<Podcast>(podcastQuery);

export const getServices = () => safeFetch<Services>(servicesQuery);

// Blog functions
export const getBlogPosts = () => safeFetch<BlogPost[]>(blogPostsQuery);

export const getBlogPost = (slug: string) => safeFetch<BlogPost>(blogPostQuery, { slug });

export const getFeaturedBlogPosts = () => safeFetch<BlogPost[]>(featuredBlogPostsQuery);
