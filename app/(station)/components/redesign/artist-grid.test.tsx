import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ArtistGrid, { type ArtistCardData } from "./artist-grid";

vi.mock("./save-artist-button", () => ({ default: () => null }));

function build(count: number): ArtistCardData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Artist ${i + 1}`,
    imageUrl: undefined,
    genres: [],
  }));
}

const links = () => screen.getAllByRole("link", { name: /^Open Artist/ });

describe("ArtistGrid", () => {
  it("shows only the initial batch and the remaining count", () => {
    render(
      <ArtistGrid artists={build(30)} initialVisible={9} batchSize={12} expandHref="/artists?expand=all" />,
    );
    expect(links()).toHaveLength(9);
    expect(screen.getByRole("button", { name: /load more \(21 left\)/i })).toBeTruthy();
  });

  it("reveals one batch per click without navigating", () => {
    render(
      <ArtistGrid artists={build(30)} initialVisible={9} batchSize={12} expandHref="/artists?expand=all" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /load more/i }));
    expect(links()).toHaveLength(21);
    expect(screen.getByRole("button", { name: /load more \(9 left\)/i })).toBeTruthy();
  });

  it("removes the button once everything is shown and announces the count", () => {
    render(
      <ArtistGrid artists={build(15)} initialVisible={9} batchSize={12} expandHref="/artists?expand=all" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /load more/i }));
    expect(links()).toHaveLength(15);
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
    expect(screen.getByText("Showing 15 of 15 artists")).toBeTruthy();
  });

  it("shows everything when initialVisible covers the list and renders no button", () => {
    render(
      <ArtistGrid artists={build(20)} initialVisible={20} batchSize={12} expandHref="/artists?expand=all" />,
    );
    expect(links()).toHaveLength(20);
    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  it("keeps a crawlable fallback link to the expanded URL", () => {
    // React omits <noscript> children on client render; crawlers get the server HTML.
    const html = renderToString(
      <ArtistGrid artists={build(30)} initialVisible={9} batchSize={12} expandHref="/artists?expand=all#all" />,
    );
    expect(html).toContain('href="/artists?expand=all#all"');
  });
});
