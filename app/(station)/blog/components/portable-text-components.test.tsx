import { PortableText } from "@portabletext/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { blogPostQuery, mainBlogPostQuery } from "@/lib/sanity/blog";
import { blogPortableTextComponents } from "./portable-text-components";

const CDN_URL =
  "https://cdn.sanity.io/images/3avbjw74/production/abc-1320x1650.jpg";

function renderBody(value: unknown[]) {
  return render(
    <PortableText
      value={value as never}
      components={blogPortableTextComponents}
    />,
  );
}

describe("blog body images", () => {
  it("renders a body image with its real dimensions and caption", () => {
    renderBody([
      {
        _type: "image",
        _key: "img1",
        alt: "TSVI at MOT",
        caption: "TSVI at MOT, London",
        asset: {
          url: CDN_URL,
          metadata: { dimensions: { width: 1320, height: 1650 } },
        },
      },
    ]);

    const img = screen.getByRole("img", { name: "TSVI at MOT" });
    expect(img).toHaveAttribute("width", "1320");
    expect(img).toHaveAttribute("height", "1650");
    expect(screen.getByText("TSVI at MOT, London")).toBeInTheDocument();
  });

  it("uses the caption as alt text when alt is missing", () => {
    renderBody([
      {
        _type: "image",
        _key: "img2",
        caption: "Boiler Room",
        asset: { url: CDN_URL },
      },
    ]);

    expect(screen.getByRole("img", { name: "Boiler Room" })).toBeInTheDocument();
  });

  it("renders nothing for an image whose asset was not dereferenced", () => {
    const { container } = renderBody([
      {
        _type: "image",
        _key: "img3",
        asset: { _ref: "image-abc-1320x1650-jpg", _type: "reference" },
      },
    ]);

    expect(container.querySelector("figure")).toBeNull();
  });
});

describe("blog post queries", () => {
  // Regression guard: a bare `content,` projection returns image assets as
  // `_ref` only, and the renderer above then drops every body image.
  it.each([
    ["mainBlogPostQuery", mainBlogPostQuery],
    ["blogPostQuery", blogPostQuery],
  ])("%s dereferences body image assets", (_name, query) => {
    expect(query).toMatch(
      /content\[\]\{\s*\.\.\.,\s*_type == "image" => \{\s*asset->\{\s*url,/,
    );
  });
});
