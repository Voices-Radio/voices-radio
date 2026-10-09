import { groq } from "next-sanity";
import type { Image, PortableTextBlock } from "sanity";
import type { EventPost, MainBlogPost } from "./blog";

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
  latestKxLane {
    title,
    description
  },
  featuredLane {
    title,
    description,
    shows[] {
      ...,
      image ${homePageImageProjection},
      _type == "homeRailShow" => {
        show
      }
    }
  },
  applyBanner {
    heading,
    mobileBody,
    ctaText
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

export interface HomeLatestKxLaneConfig {
  title?: string;
  description?: string;
}

export interface HomeFeaturedLaneConfig {
  title?: string;
  description?: string;
  shows?: Array<HomeShowSelection | HomeRailShow>;
}

export interface HomeApplyBannerConfig {
  heading?: string;
  mobileBody?: string;
  ctaText?: string;
}

export interface HomePage {
  _id: string;
  featuredContent?: HomeFeaturedContent[];
  latestKxLane?: HomeLatestKxLaneConfig;
  featuredLane?: HomeFeaturedLaneConfig;
  applyBanner?: HomeApplyBannerConfig;
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
