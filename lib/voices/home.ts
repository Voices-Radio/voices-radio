import { getHomePage } from "@/sanity.client";
import type {
  HomeFeaturedBlog,
  HomeFeaturedContent,
  HomeFeaturedEvent,
  HomePage,
  HomePageImage,
  HomeRailShow,
  HomeShowRailConfig,
  HomeShowSelection,
} from "@/sanity.queries";
import { urlForImage } from "@/sanity.image";
import type { Image } from "sanity";
import { getShowForCuration, getWebsiteRails } from "./api";
import { enhanceArtworkUrl } from "./artwork";
import { VOICES_FALLBACK_ARTWORK } from "./config";
import type { VoicesShow, VoicesWebsiteRail } from "./types";

const defaultRailDescription =
  "The Voices team has picked notable shows from the recent weeks ranging from exciting guests to curious mixes. List updated regularly.";

export type HomeFeatureImageFit = "cover" | "contain";

type HomeFeatureItemBase = {
  id: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageFit: HomeFeatureImageFit;
  imagePosition?: string;
  href: string;
  cta: string;
  meta: string;
};

export type HomeFeatureItem =
  | (HomeFeatureItemBase & {
      type: "show";
      show: VoicesShow;
    })
  | (HomeFeatureItemBase & {
      type: "blog";
    })
  | (HomeFeatureItemBase & {
      type: "event";
    });

export interface HomeLiveStreamConfig {
  fallbackImageUrl?: string;
  fallbackImageAlt?: string;
}

export interface HomePageContent {
  featuredItems: HomeFeatureItem[];
  rails: VoicesWebsiteRail[];
  latestKx: VoicesShow[];
  latestEast: VoicesShow[];
  byKey: Map<string, VoicesWebsiteRail>;
  liveStreams: {
    kx?: HomeLiveStreamConfig;
    east?: HomeLiveStreamConfig;
  };
  hasCmsHomePage: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type HomeImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
};

function formatDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return dateFormatter.format(parsed);
}

function getImageUrl(
  image?: HomePageImage,
  { width, height, quality = 92 }: HomeImageOptions = {},
) {
  if (!image) return undefined;

  if (image.assetRef) {
    try {
      let builder = urlForImage({
        ...image,
        asset: { _ref: image.assetRef },
      } as Image).quality(quality);

      if (width) {
        builder = builder.width(width);
      }

      if (height) {
        builder = builder.height(height);
      }

      if (width && height) {
        builder = builder.fit("crop");
      }

      return appendImageVersion(builder.url(), image);
    } catch {
      return image.asset?.url;
    }
  }

  return image.asset?.url;
}

function appendImageVersion(url: string, image: HomePageImage) {
  const versionParts = [
    image.crop?.top,
    image.crop?.right,
    image.crop?.bottom,
    image.crop?.left,
    image.hotspot?.x,
    image.hotspot?.y,
    image.hotspot?.width,
    image.hotspot?.height,
  ];
  const version = versionParts
    .map((value) =>
      typeof value === "number" ? Math.round(value * 10000) : "x",
    )
    .join("-");

  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("fpv", version);
    return parsedUrl.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}fpv=${encodeURIComponent(version)}`;
  }
}

function getImageAlt(image: HomePageImage | undefined, fallback: string) {
  return image?.alt || fallback;
}

function getEnhancedShowImageUrl(show: VoicesShow) {
  return (
    enhanceArtworkUrl(show.artist?.bannerUrl, { size: "feature" }) ??
    enhanceArtworkUrl(show.artwork.src, { size: "feature" }) ??
    show.artwork.src
  );
}

function getShowId(selection?: HomeShowSelection) {
  return selection?.showId;
}

function isHomeRailShow(
  selection: HomeShowSelection | HomeRailShow,
): selection is HomeRailShow {
  return selection._type === "homeRailShow" || "show" in selection;
}

function getSelectionShow(
  selection?: HomeShowSelection | HomeRailShow,
): HomeShowSelection | undefined {
  if (!selection) return undefined;
  return isHomeRailShow(selection) ? selection.show : selection;
}

function getSelectionImage(selection?: HomeShowSelection | HomeRailShow) {
  return selection && isHomeRailShow(selection) ? selection.image : undefined;
}

function buildCachedShow(selection: HomeShowSelection): VoicesShow | null {
  if (!selection.showId || !selection.title) return null;

  const imageUrl =
    enhanceArtworkUrl(selection.imageUrl, { size: "feature" }) ??
    selection.imageUrl ??
    VOICES_FALLBACK_ARTWORK;

  return {
    id: selection.showId,
    title: selection.title,
    description: "",
    date: selection.date,
    imageUrl,
    artwork: {
      src: imageUrl,
      alt: `${selection.title} artwork`,
      source: selection.imageUrl ? "show" : "fallback",
    },
    artist: selection.artistName
      ? {
          id: `${selection.showId}-cached-artist`,
          name: selection.artistName,
          bio: "",
          genres: [],
          aliases: [],
          featured: false,
          isActive: true,
          station: "unknown",
          locationTags: [],
          socialLinks: {},
        }
      : undefined,
    genres: [],
    featured: false,
    station: "unknown",
    locationTags: [],
  };
}

async function hydrateShow(selection?: HomeShowSelection) {
  const showId = getShowId(selection);
  if (!showId) return null;

  return getShowForCuration(showId).catch(() =>
    selection ? buildCachedShow(selection) : null,
  );
}

async function hydrateShows(selections: Array<HomeShowSelection | undefined>) {
  const shows = await Promise.all(selections.map(hydrateShow));
  const byId = new Map<string, VoicesShow>();

  for (const show of shows) {
    if (show) {
      byId.set(show.id, show);
    }
  }

  return byId;
}

function buildShowFeatureItem(
  item: Extract<HomeFeaturedContent, { _type: "homeFeaturedShow" }>,
  show: VoicesShow,
): HomeFeatureItem {
  const placementImageUrl = getImageUrl(item.image, {
    width: 2400,
    height: 1350,
    quality: 95,
  });
  const imageUrl = placementImageUrl ?? getEnhancedShowImageUrl(show);

  return {
    id: `show-${show.id}`,
    type: "show",
    label: item.label ?? "Show",
    title: item.title ?? show.title,
    description: item.description ?? show.description,
    imageUrl,
    imageAlt: getImageAlt(item.image, show.artwork.alt || show.title),
    imageFit: placementImageUrl ? "cover" : "contain",
    imagePosition: placementImageUrl ? undefined : "50% 50%",
    href:
      show.matchingStatus === "matched" || !show.archiveUrl
        ? `/shows/${show.id}`
        : show.archiveUrl,
    cta: item.ctaText ?? "Listen",
    meta: formatDate(show.date),
    show,
  };
}

function buildBlogFeatureItem(item: HomeFeaturedBlog): HomeFeatureItem | null {
  if (!item.blog?.slug?.current) return null;

  const sourceImage = item.image ?? item.blog.featuredImage;
  const sourceImageUrl =
    getImageUrl(item.image, { width: 2400, height: 1350, quality: 95 }) ??
    getImageUrl(item.blog.featuredImage, {
      width: 2400,
      height: 1350,
      quality: 95,
    });
  const imageUrl = sourceImageUrl ?? VOICES_FALLBACK_ARTWORK;

  return {
    id: `blog-${item.blog._id}`,
    type: "blog",
    label: item.label ?? "Blog",
    title: item.title ?? item.blog.title,
    description: item.description ?? item.blog.excerpt,
    imageUrl,
    imageAlt: getImageAlt(sourceImage, item.blog.title),
    imageFit: sourceImageUrl ? "cover" : "contain",
    imagePosition: sourceImageUrl ? undefined : "50% 50%",
    href: `/blog/${item.blog.slug.current}`,
    cta: item.ctaText ?? "Read",
    meta: formatDate(item.blog.publishedAt),
  };
}

function buildEventFeatureItem(
  item: HomeFeaturedEvent,
): HomeFeatureItem | null {
  if (!item.event?.slug?.current && !item.event?.ctaUrl) return null;

  const sourceImage = item.image ?? item.event.artwork;
  const sourceImageUrl =
    getImageUrl(item.image, { width: 2400, height: 1350, quality: 95 }) ??
    getImageUrl(item.event.artwork, {
      width: 2400,
      height: 1350,
      quality: 95,
    });
  const imageUrl = sourceImageUrl ?? VOICES_FALLBACK_ARTWORK;

  return {
    id: `event-${item.event._id}`,
    type: "event",
    label: item.label ?? "Event",
    title: item.title ?? item.event.title,
    description: item.description ?? item.event.excerpt,
    imageUrl,
    imageAlt: getImageAlt(sourceImage, item.event.title),
    imageFit: sourceImageUrl ? "cover" : "contain",
    imagePosition: sourceImageUrl ? undefined : "50% 50%",
    href: item.event.ctaUrl || `/events/${item.event.slug.current}`,
    cta: item.ctaText ?? item.event.ctaText ?? "View",
    meta: [formatDate(item.event.eventDate), item.event.venue]
      .filter(Boolean)
      .join(" / "),
  };
}

async function getHomeFeatureItems(
  homePage: HomePage | null,
  fallbackShows: VoicesShow[],
) {
  const featuredContent = homePage?.featuredContent ?? [];
  const showSelections = featuredContent
    .filter(
      (
        item,
      ): item is Extract<HomeFeaturedContent, { _type: "homeFeaturedShow" }> =>
        item._type === "homeFeaturedShow",
    )
    .map((item) => item.show);
  const showsById = await hydrateShows(showSelections);
  const items = featuredContent
    .map((item): HomeFeatureItem | null => {
      if (item._type === "homeFeaturedShow") {
        const showId = getShowId(item.show);
        const show = showId ? showsById.get(showId) : undefined;
        return show ? buildShowFeatureItem(item, show) : null;
      }

      if (item._type === "homeFeaturedBlog") {
        return buildBlogFeatureItem(item);
      }

      if (item._type === "homeFeaturedEvent") {
        return buildEventFeatureItem(item);
      }

      return null;
    })
    .filter((item): item is HomeFeatureItem => Boolean(item));

  if (items.length) return items;

  return fallbackShows.slice(0, 8).map((show) => ({
    id: `show-${show.id}`,
    type: "show" as const,
    label: "Show",
    title: show.title,
    description: show.description,
    imageUrl: getEnhancedShowImageUrl(show),
    imageAlt: show.artist?.bannerUrl
      ? `${show.artist.name} banner image`
      : show.artwork.alt,
    imageFit: "contain" as const,
    imagePosition: "50% 50%",
    href: `/shows/${show.id}`,
    cta: "Listen",
    meta: formatDate(show.date),
    show,
  }));
}

async function getCmsRails(homePage: HomePage | null) {
  const railConfigs = (homePage?.showRails ?? []).filter(
    (rail) => rail.enabled !== false,
  );
  const selections = railConfigs.flatMap((rail) => rail.shows ?? []);
  const showsById = await hydrateShows(selections.map(getSelectionShow));

  return railConfigs
    .map((rail): VoicesWebsiteRail | null => {
      const shows = getRailShows(rail, showsById);

      return {
        key: rail.key?.current ?? rail._key,
        title: rail.title,
        description: rail.description ?? "",
        station: "unknown",
        pagePlacement: ["home"],
        shows,
      };
    })
    .filter((rail): rail is VoicesWebsiteRail => Boolean(rail));
}

function getRailShows(
  rail: HomeShowRailConfig,
  showsById: Map<string, VoicesShow>,
) {
  const seen = new Set<string>();
  const shows: VoicesShow[] = [];

  for (const selection of rail.shows ?? []) {
    const showSelection = getSelectionShow(selection);
    const showId = getShowId(showSelection);
    const show = showId ? showsById.get(showId) : undefined;
    if (show && !seen.has(show.id)) {
      seen.add(show.id);
      const overrideImage = getSelectionImage(selection);
      const overrideImageUrl = getImageUrl(overrideImage, {
        width: 800,
        height: 800,
        quality: 92,
      });

      shows.push(
        overrideImageUrl
          ? {
              ...show,
              imageUrl: overrideImageUrl,
              artwork: {
                ...show.artwork,
                src: overrideImageUrl,
                alt: getImageAlt(overrideImage, show.artwork.alt || show.title),
                source: "show",
              },
            }
          : show,
      );
    }
  }

  return shows;
}

function getLiveStreamConfig(homePage: HomePage | null) {
  return {
    kx: {
      fallbackImageUrl: getImageUrl(homePage?.liveStreams?.kx?.fallbackImage, {
        width: 1000,
        height: 1000,
      }),
      fallbackImageAlt:
        homePage?.liveStreams?.kx?.fallbackImage?.alt ?? "KX live artwork",
    },
    east: {
      fallbackImageUrl: getImageUrl(
        homePage?.liveStreams?.east?.fallbackImage,
        {
          width: 1000,
          height: 1000,
        },
      ),
      fallbackImageAlt:
        homePage?.liveStreams?.east?.fallbackImage?.alt ?? "East live artwork",
    },
  };
}

export async function getHomeShowRails() {
  const rails = await getWebsiteRails();
  const byKey = new Map(rails.map((rail) => [rail.key, rail]));

  return {
    rails,
    latestKx: byKey.get("latest_kx")?.shows ?? [],
    latestEast: byKey.get("latest_east")?.shows ?? [],
    byKey,
  };
}

export async function getHomePageContent(): Promise<HomePageContent> {
  const [homePage, websiteRails] = await Promise.all([
    getHomePage(),
    getWebsiteRails(),
  ]);
  const fallbackByKey = new Map(websiteRails.map((rail) => [rail.key, rail]));
  const latestKx = fallbackByKey.get("latest_kx")?.shows ?? [];
  const latestEast = fallbackByKey.get("latest_east")?.shows ?? [];
  const fallbackFeaturedShows = [...latestKx, ...latestEast].filter(
    (show, index, shows) =>
      shows.findIndex((candidate) => candidate.id === show.id) === index,
  );
  const [featuredItems, cmsRails] = await Promise.all([
    getHomeFeatureItems(homePage, fallbackFeaturedShows),
    getCmsRails(homePage),
  ]);
  const rails = cmsRails.length ? cmsRails : websiteRails;
  const byKey = new Map(rails.map((rail) => [rail.key, rail]));

  return {
    featuredItems,
    rails,
    latestKx: byKey.get("latest_kx")?.shows ?? latestKx,
    latestEast: byKey.get("latest_east")?.shows ?? latestEast,
    byKey,
    liveStreams: getLiveStreamConfig(homePage),
    hasCmsHomePage: Boolean(homePage),
  };
}
