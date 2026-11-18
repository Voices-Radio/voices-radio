import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import VoicesImage from "./voices-image";

const SANITY_SRC =
  "https://cdn.sanity.io/images/abc/production/hash-1242x689.jpg?rect=9,0,1225,689&w=1225&h=689&fit=crop&auto=format";

describe("VoicesImage", () => {
  it("shimmers until the image loads", async () => {
    render(
      <VoicesImage src="/voices.svg" alt="Artwork" width={100} height={100} />,
    );
    const image = screen.getByAltText("Artwork");

    expect(image.className).toContain("voices-image-loading");
    fireEvent.load(image);
    // next/image runs onLoad after img.decode() resolves.
    await waitFor(() =>
      expect(image.className).not.toContain("voices-image-loading"),
    );
  });

  it("stops the shimmer when the image fails", () => {
    render(
      <VoicesImage src="/voices.svg" alt="Artwork" width={100} height={100} />,
    );
    const image = screen.getByAltText("Artwork");

    fireEvent.error(image);
    expect(image.className).not.toContain("voices-image-loading");
  });

  it("uses the blurred preview instead of the shimmer when one is given", () => {
    render(
      <VoicesImage
        src="/voices.svg"
        alt="Artwork"
        width={100}
        height={100}
        blurDataURL="data:image/jpeg;base64,AAAA"
      />,
    );
    const image = screen.getByAltText("Artwork");

    expect(image.className).not.toContain("voices-image-loading");
    expect(image.getAttribute("style")).toContain(
      "data:image/jpeg;base64,AAAA",
    );
  });

  it("can turn the shimmer off for a stacked image", () => {
    render(
      <VoicesImage
        src="/voices.svg"
        alt="Artwork"
        width={100}
        height={100}
        loadingPlaceholder={false}
      />,
    );

    expect(screen.getByAltText("Artwork").className).not.toContain(
      "voices-image-loading",
    );
  });

  it("loads Sanity images straight from Sanity's CDN", () => {
    render(<VoicesImage src={SANITY_SRC} alt="Hero" fill sizes="100vw" />);
    const image = screen.getByAltText("Hero");

    expect(image.getAttribute("src")).toMatch(/^https:\/\/cdn\.sanity\.io\//);
    expect(image.getAttribute("srcset")).not.toContain("/_next/image");
  });

  it("keeps other remote images on the built-in optimizer", () => {
    render(
      <VoicesImage
        src="https://thumbnailer.mixcloud.com/unsafe/0x0/extaudio/a"
        alt="Show"
        fill
        sizes="100vw"
      />,
    );

    expect(screen.getByAltText("Show").getAttribute("src")).toContain(
      "/_next/image",
    );
  });
});
