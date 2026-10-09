import { createClient } from "next-sanity";
import { env } from "./env";
import {
  About,
  Home,
  HomePage,
  Podcast,
  Partner,
  Settings,
  Services,
  BlogPost,
  MembershipPage,
  MembershipBenefit,
  ListingPagesCopy,
  CollaboratePageCopy,
  aboutQuery,
  servicesQuery,
  homeQuery,
  homePageQuery,
  podcastQuery,
  partnersQuery,
  settingsQuery,
  blogPostsQuery,
  blogPostQuery,
  featuredBlogPostsQuery,
  membershipPageQuery,
  membershipBenefitsQuery,
  membershipBenefitQuery,
  listingPagesQuery,
  collaboratePageQuery,
} from "./sanity.queries";

export { SANITY_CACHE_TAG } from "./lib/sanity-cache";
import {
  SANITY_CACHE_TAG,
  SANITY_REVALIDATE_SECONDS,
} from "./lib/sanity-cache";

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-06-21",
  /**
   * Stays on the live API (not the Sanity CDN): the publish webhook fires
   * revalidateTag(SANITY_CACHE_TAG) the moment content changes, and a CDN
   * read at that instant can still return the OLD document — which Next would
   * then cache. Caching happens in Next's data cache instead.
   */
  useCdn: false,
  // Previously `revalidate: 0`, which made every route that touches the shell
  // (getSettings) fully dynamic and put a Sanity round-trip in every TTFB.
  // The webhook is the freshness mechanism; the TTL is only the safety net for
  // a missed/unconfigured webhook (e.g. the staging dataset).
  fetch: {
    next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: [SANITY_CACHE_TAG] },
  },
});

// Helper function to handle Sanity fetch errors
const safeFetch = async <T>(
  query: string,
  params?: Record<string, string | number | boolean>,
): Promise<T | null> => {
  try {
    return params
      ? await client.fetch<T>(query, params)
      : await client.fetch<T>(query);
  } catch (error) {
    console.error("Sanity fetch error:", error);
    return null;
  }
};

export const getSettings = () => safeFetch<Settings>(settingsQuery);

export const getPartners = () => safeFetch<Partner[]>(partnersQuery);

export const getHome = () => safeFetch<Home>(homeQuery);

export const getHomePage = () => safeFetch<HomePage>(homePageQuery);

export const getAbout = () => safeFetch<About>(aboutQuery);

export const getPodcast = () => safeFetch<Podcast>(podcastQuery);

export const getServices = () => safeFetch<Services>(servicesQuery);

// Blog functions
export const getBlogPosts = () => safeFetch<BlogPost[]>(blogPostsQuery);

export const getBlogPost = (slug: string) =>
  safeFetch<BlogPost>(blogPostQuery, { slug });

export const getFeaturedBlogPosts = () =>
  safeFetch<BlogPost[]>(featuredBlogPostsQuery);

// Page copy
export const getListingPages = () =>
  safeFetch<ListingPagesCopy>(listingPagesQuery);

export const getCollaboratePage = () =>
  safeFetch<CollaboratePageCopy>(collaboratePageQuery);

// Membership functions
export const getMembershipPage = () =>
  safeFetch<MembershipPage>(membershipPageQuery);

export const getMembershipBenefits = () =>
  safeFetch<MembershipBenefit[]>(membershipBenefitsQuery);

export const getMembershipBenefit = (slug: string) =>
  safeFetch<MembershipBenefit>(membershipBenefitQuery, { slug });
