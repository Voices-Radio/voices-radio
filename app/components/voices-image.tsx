"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { getImageLoader } from "@/lib/images/sanity-image";
import { cn } from "@/lib/utils";

function getSrcKey(src: ImageProps["src"]) {
  if (typeof src === "string") return src;
  return "default" in src ? src.default.src : src.src;
}

export type VoicesImageProps = ImageProps & {
  /**
   * Show the shimmer while the image loads. Turn it off for an image stacked
   * over another one that already carries the placeholder.
   */
  loadingPlaceholder?: boolean;
};

/**
 * next/image with two site-wide defaults:
 *
 * - Sanity images load straight from Sanity's CDN (see sanity-image.ts)
 *   rather than through a second optimisation pass on Vercel.
 * - Until the pixels arrive, the image shows a shimmer (or the blurred preview
 *   when one is supplied) instead of an empty dark box.
 *
 * It is a client component because both a loader function and an onLoad
 * handler must live on the client; server components can still render it
 * with plain serialisable props.
 */
export default function VoicesImage({
  alt,
  className,
  loader,
  onLoad,
  onError,
  placeholder,
  loadingPlaceholder = true,
  ...props
}: VoicesImageProps) {
  const srcKey = getSrcKey(props.src);
  // Tracks which src has settled, so an image that swaps `src` shows the
  // placeholder again rather than inheriting the previous image's state.
  const [settledSrc, setSettledSrc] = useState<string | null>(null);
  const hasBlur = placeholder === "blur" || Boolean(props.blurDataURL);
  const isLoading = loadingPlaceholder && !hasBlur && settledSrc !== srcKey;

  return (
    <Image
      {...props}
      alt={alt}
      placeholder={hasBlur ? "blur" : placeholder}
      loader={loader ?? getImageLoader(props.src)}
      className={cn(className, isLoading && "voices-image-loading")}
      onLoad={(event) => {
        setSettledSrc(srcKey);
        onLoad?.(event);
      }}
      onError={(event) => {
        // Stop the shimmer; a failed image should not look like it is loading.
        setSettledSrc(srcKey);
        onError?.(event);
      }}
    />
  );
}
