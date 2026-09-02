import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";

export const settingsQuery = groq`*[_type == "settings"][0]`;

export interface Settings {
  title: string;
  description: string;
  ogImage: Image;
  /**
   * PortableText
   */
  address: PortableTextBlock[];
  contact_link: string;
  twitter_link: string;
  instagram_link: string;
  facebook_link: string;
  linkedin_link: string;
  mixcloud_link: string;
  store_link: string;
  podcast_link: string;
  apply_link: string;
}

export const partnersQuery = groq`*[_type == "partner"] | order(name desc)`;

export interface Partner {
  name: string;
  logo: Image;
  /**
   * PortableText
   */
  details: PortableTextBlock[];
}

export const homeQuery = groq`*[_type == "home"][0] {
  ...,
  apply_background {
    ...,
    "lqip": asset->metadata.lqip
  }
}
`;

export interface Home {
  schedule: string;

  community_heading: string;
  community_subheading: PortableTextBlock[];

  community_cta_text?: string;
  community_cta_url?: string;

  community_carousel: Image[];

  community_heading_secondary: string;
  community_subheading_secondary: PortableTextBlock[];

  community_cta_text_secondary?: string;
  community_cta_url_secondary?: string;

  community_carousel_secondary: Image[];

  apply_background: Image & { lqip: string };
  apply_heading: string;
  apply_subheading: string;
  apply_cta_text: string;
  apply_cta_url: string;
}

const homePageImageProjection = groq`{
  ...,
  "assetRef": asset._ref,
  crop,
  hotspot,
  asset->{
    _id,
    url,
    metadata {
      lqip
    }
  }
}`;

export const homePageQuery = groq`*[_type == "homePage"][0] {
  _id,
  featuredContent[] {
    _key,
    _type,
    label,
    title,
    description,
    ctaText,
    image ${homePageImageProjection},
    _type == "homeFeaturedShow" => {
      show
    },
    _type == "homeFeaturedBlog" => {
      blog->{
        _id,
        title,
        slug,
        excerpt,
        featuredImage ${homePageImageProjection},
        author,
        categories,
        publishedAt
      }
    },
    _type == "homeFeaturedEvent" => {
      event->{
        _id,
        title,
        slug,
        excerpt,
        artwork ${homePageImageProjection},
        eventDate,
        venue,
        ctaText,
        ctaUrl
      }
    }
  },
  liveStreams {
    kx {
      fallbackImage ${homePageImageProjection}
    },
    east {
      fallbackImage ${homePageImageProjection}
    }
  },
  showRails[] {
    _key,
    title,
    description,
    key,
    enabled,
    shows[] {
      ...,
      image ${homePageImageProjection},
      _type == "homeRailShow" => {
        show
      }
    }
  }
}`;

export interface HomePageImage {
  alt?: string;
  assetRef?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  asset?: {
    _id?: string;
    url: string;
    metadata?: {
      lqip?: string;
    };
  };
}

export interface HomeShowSelection {
  _type?: "homeShowSelection";
  showId?: string;
  title?: string;
  date?: string;
  artistName?: string;
  imageUrl?: string;
  matchingStatus?: string;
}

export interface HomeRailShow {
  _key?: string;
  _type?: "homeRailShow";
  show?: HomeShowSelection;
  image?: HomePageImage;
}

interface HomeFeaturedBase {
  _key: string;
  label?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  image?: HomePageImage;
}

export interface HomeFeaturedShow extends HomeFeaturedBase {
  _type: "homeFeaturedShow";
  show?: HomeShowSelection;
}

export interface HomeFeaturedBlog extends HomeFeaturedBase {
  _type: "homeFeaturedBlog";
  blog?: Pick<
    MainBlogPost,
    | "_id"
    | "title"
    | "slug"
    | "excerpt"
    | "author"
    | "categories"
    | "publishedAt"
  > & {
    featuredImage?: HomePageImage;
  };
}

export interface HomeFeaturedEvent extends HomeFeaturedBase {
  _type: "homeFeaturedEvent";
  event?: Pick<
    EventPost,
    | "_id"
    | "title"
    | "slug"
    | "excerpt"
    | "eventDate"
    | "venue"
    | "ctaText"
    | "ctaUrl"
  > & {
    artwork?: HomePageImage;
  };
}

export type HomeFeaturedContent =
  HomeFeaturedShow | HomeFeaturedBlog | HomeFeaturedEvent;

export interface HomeShowRailConfig {
  _key: string;
  title: string;
  description?: string;
  key?: { current?: string };
  enabled?: boolean;
  shows?: Array<HomeShowSelection | HomeRailShow>;
}

export interface HomePage {
  _id: string;
  featuredContent?: HomeFeaturedContent[];
  liveStreams?: {
    kx?: {
      fallbackImage?: HomePageImage;
    };
    east?: {
      fallbackImage?: HomePageImage;
    };
  };
  showRails?: HomeShowRailConfig[];
}

export const aboutQuery = groq`*[_type == "about"][0] {
  ...,
  hero_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  our_values_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  community_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  bookings_image {
    ...,
    "lqip": asset->metadata.lqip
  }
}`;

export interface About {
  hero_image: Image & { lqip: string };

  got_here_heading: string;
  got_here: PortableTextBlock[];

  bookings_heading: string;
  bookings: PortableTextBlock[];
  bookings_image: Image & { lqip: string };

  our_values_heading: string;
  our_values: PortableTextBlock[];
  our_values_image: Image & { lqip: string };

  community_heading: string;
  community: PortableTextBlock[];
  community_image: Image & { lqip: string };
}

export const podcastQuery = groq`*[_type == "podcast"][0] {
  ...,
  hero_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  podcast_main_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  podcast_final_image {
    ...,
    "lqip": asset->metadata.lqip
  }
}`;

export interface Podcast {
  hero_image: Image & { lqip: string };

  heading_podcast_intro: string;
  podcast_cta_text?: string;
  podcast_cta_url?: string;
  podcast_intro_content: PortableTextBlock[];

  podcast_main_heading: string;
  podcast_main: PortableTextBlock[];
  podcast_main_image: Image & { lqip: string };

  podcast_final_heading: string;
  podcast_final: PortableTextBlock[];
  podcast_final_image: Image & { lqip: string };
}

export const servicesQuery = groq`*[_type == "services"][0] {
  ...,
  hero_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  services_main1_image {
    ...,
    "lqip": asset->metadata.lqip
  },
    services_main2_image {
    ...,
    "lqip": asset->metadata.lqip
  },
    services_main3_image {
    ...,
    "lqip": asset->metadata.lqip
  },
    services_main4_image {
    ...,
    "lqip": asset->metadata.lqip
  },
  services_final_image {
    ...,
    "lqip": asset->metadata.lqip
  }
}`;

export interface Services {
  hero_image: Image & { lqip: string };

  services_heading: string;
  services_main: PortableTextBlock[];

  services_heading1: string;
  services_main1: PortableTextBlock[];
  services_main1_image: Image & { lqip: string };

  services_heading2: string;
  services_main2: PortableTextBlock[];
  services_main2_image: Image & { lqip: string };

  services_heading3: string;
  services_main3: PortableTextBlock[];
  services_main3_image: Image & { lqip: string };

  services_heading4: string;
  services_main4: PortableTextBlock[];
  services_main4_image: Image & { lqip: string };

  services_final: PortableTextBlock[];
  services_final_image: Image & { lqip: string };
}

// Blog Queries
export const blogPostsQuery = groq`*[_type == "blog"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  tags,
  publishedAt,
  featured,
  metaTitle,
  metaDescription,
  keywords
}`;

export const blogPostQuery = groq`*[_type == "blog" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  content,
  author,
  categories,
  tags,
  publishedAt,
  featured,
  metaTitle,
  metaDescription,
  keywords,
  ogImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  }
}`;

export const featuredBlogPostsQuery = groq`*[_type == "blog" && featured == true] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  publishedAt
}`;

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  featuredImage?: {
    asset?: {
      url: string;
      metadata: {
        lqip: string;
      };
    };
  };
  content?: PortableTextBlock[];
  author: string;
  categories?: string[];
  tags?: string[];
  publishedAt: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: {
    asset?: {
      url: string;
      metadata: {
        lqip: string;
      };
    };
  };
}

// Main Website Blog Queries
export const mainBlogPostsQuery = groq`*[_type == "mainBlog" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  tags,
  publishedAt,
  featured,
  metaTitle,
  metaDescription,
  keywords
}`;

/** Slugs + dates for sitemap (published main site blog posts only) */
export const mainBlogSitemapQuery = groq`*[_type == "mainBlog" && status == "published"] {
  "slug": slug.current,
  "lastModified": coalesce(publishedAt, _updatedAt)
}`;

/** Slugs + dates for sitemap (published podcast blog posts only) */
export const podcastBlogSitemapQuery = groq`*[_type == "blog" && status == "published"] {
  "slug": slug.current,
  "lastModified": coalesce(publishedAt, _updatedAt)
}`;

export const mainBlogPostQuery = groq`*[_type == "mainBlog" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip,
        dimensions {
          aspectRatio
        }
      }
    }
  },
  content,
  author,
  categories,
  tags,
  publishedAt,
  featured,
  metaTitle,
  metaDescription,
  keywords,
  relatedShowId,
  ogImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  }
}`;

/**
 * Up to three posts sharing a category with the current one, newest first.
 *
 * Replaces fetching every published post and slicing the first three in JS —
 * that got more expensive with every post published, and "related" meant
 * nothing more than "recent".
 */
export const relatedMainBlogPostsQuery = groq`*[
  _type == "mainBlog"
  && status == "published"
  && _id != $id
  && count((categories[])[@ in $categories]) > 0
] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  publishedAt
}`;

/** Newest published post older than $publishedAt — the "up next" tile. */
export const nextMainBlogPostQuery = groq`*[
  _type == "mainBlog"
  && status == "published"
  && _id != $id
  && publishedAt < $publishedAt
] | order(publishedAt desc)[0] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  publishedAt
}`;

/** Fallback for the "up next" tile on the oldest post: the newest one. */
export const newestMainBlogPostQuery = groq`*[
  _type == "mainBlog"
  && status == "published"
  && _id != $id
] | order(publishedAt desc)[0] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  publishedAt
}`;

export const featuredMainBlogPostsQuery = groq`*[_type == "mainBlog" && featured == true && status == "published"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  author,
  categories,
  publishedAt
}`;

export const featuredEventsQuery = groq`*[_type == "event" && featured == true && status == "published"] | order(eventDate asc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  artwork {
    ...,
    asset->{
      url,
      metadata {
        lqip
      }
    }
  },
  eventDate,
  venue,
  ctaText,
  ctaUrl
}`;

export interface MainBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  featuredImage?: {
    asset?: {
      url: string;
      metadata: {
        lqip: string;
        /** Only projected by `mainBlogPostQuery`, for the article hero. */
        dimensions?: {
          aspectRatio: number;
        };
      };
    };
  };
  content?: PortableTextBlock[];
  author: string;
  categories?: string[];
  tags?: string[];
  publishedAt: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  /**
   * Optional Voices show id. When set, the article offers the show in the
   * archive mini player, so the audio keeps playing while the post is read.
   */
  relatedShowId?: string;
  ogImage?: {
    asset?: {
      url: string;
      metadata: {
        lqip: string;
      };
    };
  };
}

export interface EventPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  artwork?: {
    alt?: string;
    asset?: {
      url: string;
      metadata: {
        lqip: string;
      };
    };
  };
  eventDate: string;
  venue?: string;
  ctaText?: string;
  ctaUrl?: string;
}

// Membership Queries

/** Reusable GROQ filter clause: only content with no effectiveFrom, or one that has already passed. */
const notFutureDated = groq`(!defined(effectiveFrom) || effectiveFrom <= now())`;

export const membershipPageQuery = groq`*[_type == "membershipPage"][0]`;

export interface MembershipFaq {
  question: string;
  answer: PortableTextBlock[];
}

export interface MembershipPage {
  support_heading: string;
  support_subheading: string;
  support_primary_cta_text?: string;
  support_secondary_cta_text?: string;
  support_radio_stays_open_heading: string;
  support_radio_stays_open_body: string;
  support_impact_heading?: string;
  support_impact_body?: PortableTextBlock[];

  join_heading: string;
  join_subheading?: string;
  join_ballot_disclaimer: string;

  faqs?: MembershipFaq[];

  dashboard_announcement?: string;
  founding_member_badge_text: string;
  cancellation_copy?: string;
  supporter_downgrade_offer_heading?: string;
  supporter_downgrade_offer_body?: string;
}

export const membershipTiersQuery = groq`*[_type == "membershipTier" && ${notFutureDated}] | order(sortOrder asc)`;

export interface MembershipTier {
  _id: string;
  tierId: { current: string };
  name: string;
  headline: string;
  description?: string;
  monthlyPriceDisplay: string;
  annualPriceDisplay: string;
  benefitBullets: string[];
  mostPopular?: boolean;
  sortOrder: number;
}

export const membershipBenefitsQuery = groq`*[_type == "membershipBenefit" && ${notFutureDated}]`;

export const membershipBenefitQuery = groq`*[_type == "membershipBenefit" && slug.current == $slug && ${notFutureDated}][0]`;

export interface MembershipBenefit {
  _id: string;
  slug: { current: string };
  name: string;
  summary: string;
  fullDescription?: string;
  eligibilityExplanation?: string;
  redemptionInstructions?: string;
  terms?: string;
  availableTierIds?: string[];
  isCapacityLimited?: boolean;
}
