import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MainBlogPost } from "@/sanity.queries";
import BlogPostCard from "./blog-post-card";

function buildPost(overrides: Partial<MainBlogPost> = {}): MainBlogPost {
  return {
    _id: "post-1",
    title: "Inside the new studio",
    slug: { current: "inside-the-new-studio" },
    excerpt: "How the Kings Cross booth came together.",
    author: "Jack",
    categories: ["behind-the-scenes"],
    publishedAt: "2026-08-12T09:00:00.000Z",
    featuredImage: {
      asset: {
        url: "https://cdn.example.com/studio.jpg",
        metadata: { lqip: "data:image/png;base64,abc" },
      },
    },
    ...overrides,
  } as MainBlogPost;
}

describe("BlogPostCard", () => {
  it("links the whole card, with the title as the accessible name", () => {
    render(<BlogPostCard post={buildPost()} />);

    const link = screen.getByRole("link", { name: "Inside the new studio" });
    expect(link).toHaveAttribute("href", "/blog/inside-the-new-studio");
    // The stretched-link pseudo-element is what makes the card clickable
    // rather than just the title text.
    expect(link.className).toMatch(/after:absolute/);
    expect(link.className).toMatch(/after:inset-0/);
  });

  it("is the only link on the card, so there is one target not two", () => {
    const { container } = render(<BlogPostCard post={buildPost()} />);

    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("stamps the first category and shows a GB-formatted date", () => {
    render(<BlogPostCard post={buildPost()} />);

    expect(screen.getByText("Behind The Scenes")).toBeInTheDocument();
    expect(screen.getByText("12 Aug 2026")).toBeInTheDocument();
  });

  it("uses the fetched LQIP as the blur placeholder", () => {
    const { container } = render(<BlogPostCard post={buildPost()} />);

    const image = container.querySelector("img");
    expect(image?.getAttribute("src")).toContain("studio.jpg");
    // next/image renders the blur as an inline background while loading.
    expect(image?.getAttribute("style") ?? "").toContain("data:image/png");
  });

  it("falls back to a typographic tile rather than a shared stock photo", () => {
    const { container } = render(
      <BlogPostCard post={buildPost({ featuredImage: undefined })} />,
    );

    expect(container.querySelector("img")).toBeNull();
    // The title carries the tile, so it appears twice: once in the artwork
    // slot, once as the heading.
    expect(screen.getAllByText("Inside the new studio")).toHaveLength(2);
  });

  it("renders without a category or an excerpt", () => {
    render(
      <BlogPostCard
        post={buildPost({ categories: undefined, excerpt: "" })}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Inside the new studio" }),
    ).toBeInTheDocument();
  });
});
