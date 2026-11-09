import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";

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
