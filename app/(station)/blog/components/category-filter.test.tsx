import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryFilter from "./category-filter";

describe("CategoryFilter", () => {
  it("renders nothing when no categories are in use", () => {
    const { container } = render(
      <CategoryFilter categories={[]} selected={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("links an unselected category to a URL that adds it", () => {
    render(
      <CategoryFilter categories={["news", "music"]} selected={[]} />,
    );

    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute(
      "href",
      "/blog?category=news",
    );
  });

  it("offers a selected category's chip as a remove control", () => {
    render(
      <CategoryFilter categories={["news", "music"]} selected={["news"]} />,
    );

    expect(
      screen.getByRole("link", { name: "Remove News filter" }),
    ).toHaveAttribute("href", "/blog");
  });

  it("keeps existing selections when adding another category", () => {
    render(
      <CategoryFilter categories={["news", "music"]} selected={["news"]} />,
    );

    expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute(
      "href",
      "/blog?category=news&category=music",
    );
  });

  it("shows Clear all only once something is selected", () => {
    const { rerender } = render(
      <CategoryFilter categories={["news"]} selected={[]} />,
    );
    expect(screen.queryByText("Clear all")).toBeNull();

    rerender(<CategoryFilter categories={["news"]} selected={["news"]} />);
    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("formats hyphenated category labels for display", () => {
    render(
      <CategoryFilter categories={["behind-the-scenes"]} selected={[]} />,
    );

    expect(
      screen.getByRole("link", { name: "Behind The Scenes" }),
    ).toHaveAttribute("href", "/blog?category=behind-the-scenes");
  });
});
