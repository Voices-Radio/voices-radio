import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExplorePage from "./page";

describe("ExplorePage", () => {
  it("opens Podcast and Agency category tiles in new tabs", async () => {
    render(await ExplorePage({ searchParams: Promise.resolve({}) }));

    for (const label of ["Podcast", "Agency"]) {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
