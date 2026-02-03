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


  services_heading1 : string;
  services_main1: PortableTextBlock[];
  services_main1_image: Image & { lqip: string };

  services_heading2 : string;
  services_main2: PortableTextBlock[];
  services_main2_image: Image & { lqip: string };

  services_heading3 : string;
  services_main3: PortableTextBlock[];
  services_main3_image: Image & { lqip: string };

  services_heading4 : string;
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