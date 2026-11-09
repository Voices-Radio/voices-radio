import Image from "next/image";
import type { MainBlogPost } from "@/sanity.queries";
import PostImage from "./post-image";

/** Below this, an image is portrait or square enough that cropping it to a
 *  16:9 band would cut through whatever it is a picture of. */
const LANDSCAPE_THRESHOLD = 1.2;

/**
 * The article's lead image, held in a 16:9 band.
 *
 * Editors upload whatever the story has — a landscape studio shot, a square
 * record sleeve, a portrait of a DJ. Cropping all of that to a wide band
 * takes the top off people's heads, so anything not comfortably landscape is
 * contained and set against a blurred enlargement of itself. That is the
 * same treatment the home feature panel uses for `imageFit: "contain"`
 * artwork, which is why an odd aspect ratio never breaks the layout there.
 */
export default function ArticleHero({ post }: { post: MainBlogPost }) {
  const asset = post.featuredImage?.asset;
  const aspectRatio = asset?.metadata?.dimensions?.aspectRatio;
  const landscape = !aspectRatio || aspectRatio >= LANDSCAPE_THRESHOLD;

  if (!asset?.url || landscape) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden border border-voicesNext-border">
        <PostImage
          post={post}
          sizes="(min-width: 768px) 720px, 100vw"
          priority
        />
      </div>
    );
  }

  const lqip = asset.metadata?.lqip;

  return (
    <div className="relative aspect-[16/9] overflow-hidden border border-voicesNext-border bg-voicesNext-background">
      <Image
        src={asset.url}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 768px) 720px, 100vw"
        className="scale-110 object-cover opacity-50 blur-2xl"
      />
      <div className="bg-voicesNext-background/35 absolute inset-0" />
      <Image
        src={asset.url}
        alt={post.title}
        fill
        sizes="(min-width: 768px) 720px, 100vw"
        priority
        className="object-contain"
        {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
      />
    </div>
  );
}
