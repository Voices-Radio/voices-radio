import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GenreBrowser from "./genre-browser";

describe("GenreBrowser", () => {
  it("marks every genre link nofollow so crawlers do not walk combinations", () => {
    render(
      <GenreBrowser
        selectedGenres={[]}
        buildToggleHref={(key) => `/explore?genre=${encodeURIComponent(key)}`}
      />,
    );

    const links = screen.getAllByRole("link", { hidden: true });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("rel", "nofollow");
    }
  });
});
