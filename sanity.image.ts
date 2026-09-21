import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { env } from "./env";

/** Blog GROQ projection: resolved asset + optional crop/hotspot from Studio. */
export type BlogSanityImage = {
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
  };
  crop?: Image["crop"];
  hotspot?: Image["hotspot"];
};

const imageBuilder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

/** GROQ often returns `asset._id` instead of `_ref`; image-url needs `_ref` for crop/hotspot. */
function imageSourceWithRef(image: BlogSanityImage) {
  const asset = image?.asset as { _ref?: string; _id?: string } | undefined;
  const ref = asset?._ref ?? asset?._id;
  if (!ref) return null;
  return { ...image, asset: { _ref: ref } };
}

export const urlForImage = (source: Image) => {
  const resolved = imageSourceWithRef(source);
  if (!resolved) {
    throw new Error("Invalid source image");
  }

  return imageBuilder.image(resolved as any).auto("format").fit("max");
};

/** Blog / hero images: respects Studio crop + hotspot (`fit("crop")`). */
export const urlForBlogImage = (source: BlogSanityImage) => {
  const resolved = imageSourceWithRef(source);
  if (!resolved) {
    throw new Error("Invalid source image");
  }

  return imageBuilder.image(resolved as any).auto("format").fit("crop");
};

/** Blog featured / OG: uses crop when `asset._ref` exists; otherwise raw CDN URL. */
export function urlForBlogImageSafe(
  image: BlogSanityImage | undefined | null,
  width: number,
  height: number,
  fallback = "/studio-1.jpg",
): string {
  if (!image?.asset) return fallback;
  try {
    return urlForBlogImage(image).width(width).height(height).url();
  } catch {
    const url = (image.asset as { url?: string }).url;
    return url ?? fallback;
  }
}

/** Open Graph / Twitter image: prefers `ogImage`, else featured (1200×630 crop). */
export function blogShareImageUrl(
  ogImage: BlogSanityImage | undefined | null,
  featuredImage: BlogSanityImage | undefined | null,
  fallback = "/studio-1.jpg",
): string {
  if (ogImage?.asset) {
    return urlForBlogImageSafe(ogImage, 1200, 630, fallback);
  }
  return urlForBlogImageSafe(featuredImage, 1200, 630, fallback);
}

/** Inline body images in blog posts (16:9 crop from Studio). */
export function portableTextBlogImageSrc(value: BlogSanityImage): string {
  return urlForBlogImageSafe(value, 896, 504);
}
