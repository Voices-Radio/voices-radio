import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { dataset, projectId } from "./sanity.env";

const imageBuilder = createImageUrlBuilder({
  projectId,
  dataset,
});

export const urlForImage = (source: Image) => {
  if (!source?.asset?._ref) {
    throw new Error("Invalid source image");
  }

  return imageBuilder.image(source).auto("format").fit("max");
};
