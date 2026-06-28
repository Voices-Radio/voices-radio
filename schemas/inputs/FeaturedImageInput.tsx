"use client";

import { Button, Card, Spinner, Stack, Text } from "@sanity/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageInputProps, ImageValue, Path } from "sanity";
import { PatchEvent, set, useClient, useFormValue } from "sanity";
import { enhanceArtworkUrl } from "@/lib/voices/artwork";

type FeaturedImageValue = ImageValue & {
  alt?: string;
  featuredSourceKey?: string;
};

type ReferenceValue = {
  _ref?: string;
};

type ShowValue = {
  showId?: string;
  imageUrl?: string;
  title?: string;
};

type SourceImage = {
  assetRef: string;
  alt?: string;
  sourceKey: string;
};

const API_VERSION = "2023-06-21";

function getParentPath(path: Path) {
  return path.slice(0, -1);
}

function getSourceKey({
  itemType,
  blog,
  event,
  show,
}: {
  itemType?: string;
  blog?: ReferenceValue;
  event?: ReferenceValue;
  show?: ShowValue;
}) {
  if (itemType === "homeFeaturedBlog" && blog?._ref) {
    return `blog:${blog._ref}`;
  }

  if (itemType === "homeFeaturedEvent" && event?._ref) {
    return `event:${event._ref}`;
  }

  if (itemType === "homeFeaturedShow" && show?.showId) {
    const sourceUrl = enhanceArtworkUrl(show.imageUrl, { size: "feature" });

    return `show:${show.showId}:${sourceUrl ?? "missing"}`;
  }

  return undefined;
}

function getSourceIdentity(sourceKey?: string) {
  if (!sourceKey) return undefined;
  const [type, id] = sourceKey.split(":");

  return type && id ? `${type}:${id}` : sourceKey;
}

async function readProxyResponse(response: Response) {
  if (response.ok) return response.blob();

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(
    payload?.error ?? "Could not import the selected show image.",
  );
}

export default function FeaturedImageInput(
  props: ImageInputProps & { value?: FeaturedImageValue },
) {
  const { onChange } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const parentPath = useMemo(() => getParentPath(props.path), [props.path]);
  const itemType = useFormValue([...parentPath, "_type"]) as string | undefined;
  const blog = useFormValue([...parentPath, "blog"]) as
    | ReferenceValue
    | undefined;
  const event = useFormValue([...parentPath, "event"]) as
    | ReferenceValue
    | undefined;
  const show = useFormValue([...parentPath, "show"]) as ShowValue | undefined;
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [manualImportKey, setManualImportKey] = useState(0);
  const handledManualImportKey = useRef(0);

  const sourceKey = getSourceKey({ itemType, blog, event, show });
  const currentSourceKey = props.value?.featuredSourceKey;
  const hasImage = Boolean(props.value?.asset?._ref);
  const hasManualImportRequest =
    manualImportKey !== handledManualImportKey.current;
  const shouldSeed =
    Boolean(sourceKey) &&
    (!hasImage ||
      (Boolean(currentSourceKey) &&
        currentSourceKey !== sourceKey &&
        getSourceIdentity(currentSourceKey) !== getSourceIdentity(sourceKey)));
  const canRefreshShowImage =
    itemType === "homeFeaturedShow" &&
    Boolean(show?.showId && show.imageUrl && hasImage && currentSourceKey);

  useEffect(() => {
    if (!sourceKey || (!shouldSeed && !hasManualImportRequest)) return;

    let cancelled = false;
    const resolvedSourceKey = sourceKey;
    const resolvedManualImportKey = manualImportKey;

    async function resolveSourceImage(): Promise<SourceImage> {
      if (itemType === "homeFeaturedBlog" && blog?._ref) {
        const image = await client.fetch<{
          assetRef?: string;
          alt?: string;
        } | null>(
          `*[_id == $id][0]{
            "assetRef": featuredImage.asset._ref,
            "alt": featuredImage.alt
          }`,
          { id: blog._ref },
        );

        if (!image?.assetRef) {
          throw new Error("The selected blog post does not have an image.");
        }

        return {
          assetRef: image.assetRef,
          alt: image.alt,
          sourceKey: resolvedSourceKey,
        };
      }

      if (itemType === "homeFeaturedEvent" && event?._ref) {
        const image = await client.fetch<{
          assetRef?: string;
          alt?: string;
        } | null>(
          `*[_id == $id][0]{
            "assetRef": artwork.asset._ref,
            "alt": artwork.alt
          }`,
          { id: event._ref },
        );

        if (!image?.assetRef) {
          throw new Error("The selected event does not have artwork.");
        }

        return {
          assetRef: image.assetRef,
          alt: image.alt,
          sourceKey: resolvedSourceKey,
        };
      }

      if (itemType === "homeFeaturedShow" && show?.showId && !show.imageUrl) {
        throw new Error(
          "The selected show does not provide an importable image. Upload one manually below.",
        );
      }

      if (itemType === "homeFeaturedShow" && show?.showId && show.imageUrl) {
        const sourceUrl =
          enhanceArtworkUrl(show.imageUrl, { size: "feature" }) ??
          show.imageUrl;
        const existingAssetId = await client.fetch<string | null>(
          `*[
            _type == "sanity.imageAsset" &&
            source.name == "voices-featured-show" &&
            source.id == $sourceKey
          ][0]._id`,
          { sourceKey: resolvedSourceKey },
        );

        if (existingAssetId) {
          return {
            assetRef: existingAssetId,
            alt: show.title ? `${show.title} artwork` : undefined,
            sourceKey: resolvedSourceKey,
          };
        }

        const response = await fetch(
          `/api/voices/admin-image-proxy?url=${encodeURIComponent(
            sourceUrl,
          )}`,
          { headers: { Accept: "image/*" } },
        );
        const blob = await readProxyResponse(response);
        const asset = await client.assets.upload("image", blob, {
          contentType: blob.type,
          preserveFilename: false,
          source: {
            id: resolvedSourceKey,
            name: "voices-featured-show",
            url: sourceUrl,
          },
          title: show.title
            ? `${show.title} featured artwork`
            : "Featured show artwork",
        });

        return {
          assetRef: asset._id,
          alt: show.title ? `${show.title} artwork` : undefined,
          sourceKey: resolvedSourceKey,
        };
      }

      throw new Error("Select content before preparing its featured image.");
    }

    async function seedImage() {
      setStatus("loading");
      setError("");

      try {
        const sourceImage = await resolveSourceImage();
        if (cancelled) return;

        onChange(
          PatchEvent.from(
            set({
              _type: "image",
              asset: {
                _type: "reference",
                _ref: sourceImage.assetRef,
              },
              alt: sourceImage.alt,
              featuredSourceKey: sourceImage.sourceKey,
            }),
          ),
        );
        setError("");
      } catch (seedError) {
        if (!cancelled) {
          setError(
            seedError instanceof Error
              ? seedError.message
              : "Could not prepare the featured image.",
          );
        }
      } finally {
        if (!cancelled) {
          handledManualImportKey.current = resolvedManualImportKey;
          setStatus("idle");
        }
      }
    }

    void seedImage();

    return () => {
      cancelled = true;
    };
  }, [
    blog?._ref,
    client,
    event?._ref,
    hasManualImportRequest,
    itemType,
    manualImportKey,
    onChange,
    shouldSeed,
    show?.imageUrl,
    show?.showId,
    show?.title,
    sourceKey,
  ]);

  return (
    <Stack space={3}>
      {status === "loading" ? (
        <Card border padding={3} radius={2} tone="primary">
          <Stack space={3}>
            <Spinner muted />
            <Text size={1}>
              Preparing image for placement-specific cropping...
            </Text>
          </Stack>
        </Card>
      ) : null}

      {error ? (
        <Card border padding={3} radius={2} tone="critical">
          <Stack space={3}>
            <Text size={1}>{error}</Text>
            <Button
              mode="ghost"
              onClick={() => setManualImportKey((current) => current + 1)}
              text="Try importing again"
              tone="critical"
            />
          </Stack>
        </Card>
      ) : null}

      {canRefreshShowImage && status !== "loading" ? (
        <Card border padding={3} radius={2} tone="caution">
          <Stack space={3}>
            <Text size={1}>
              Refresh this imported show image to pull the highest available
              Mixcloud/SoundCloud source. Existing crop and hotspot edits will
              be replaced by the new imported image.
            </Text>
            <Button
              mode="ghost"
              onClick={() => setManualImportKey((current) => current + 1)}
              text="Refresh imported image"
              tone="caution"
            />
          </Stack>
        </Card>
      ) : null}

      {props.renderDefault(props)}
    </Stack>
  );
}
