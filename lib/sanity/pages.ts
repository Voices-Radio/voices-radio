import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";

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
  },
  seoOgImage {
    ...,
    "lqip": asset->metadata.lqip
  }
}`;

export interface PodcastFaqItem {
  question: string;
  answer: string;
}

export interface PodcastService {
  name: string;
  description?: string;
  priceFrom?: string;
}

export interface Podcast {
  hero_image: Image & { lqip: string };
  heroImageAlt?: string;

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

  // SEO
  h1Override?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: Image & { lqip: string };
  seoKeywords?: string[];

  // Local business
  streetAddress?: string;
  locality?: string;
  postalCode?: string;
  phone?: string;
  openingHours?: string[];
  priceRange?: string;
  geoLat?: number;
  geoLng?: number;

  // Structured data
  studioServices?: PodcastService[];
  faq?: PodcastFaqItem[];
}

export const locationPageSlugsQuery = groq`*[_type == "locationPage"] { "slug": slug.current, _updatedAt }`;

export const locationPageBySlugQuery = groq`*[_type == "locationPage" && slug.current == $slug][0] {
  ...,
  ogImage {
    ...,
    "lqip": asset->metadata.lqip
  }
}`;

export interface LocationPageFaqItem {
  question: string;
  answer: string;
}

export interface LocationPage {
  title: string;
  slug: { current: string };
  h1: string;
  localityName: string;
  intro?: PortableTextBlock[];
  body?: PortableTextBlock[];
  faq?: LocationPageFaqItem[];
  ctaText?: string;
  ctaUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: Image & { lqip: string };
  keywords?: string[];
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
