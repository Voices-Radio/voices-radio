import { describe, expect, it } from "vitest";
import {
  collectCategories,
  estimateReadingTime,
  filterPostsByCategories,
  formatCategoryLabel,
  formatPostDate,
  pickFallbackTileVariant,
  toIsoDate,
} from "./blog";

describe("formatPostDate", () => {
  it("formats in en-GB to match the rest of the site", () => {
    expect(formatPostDate("2026-08-12T09:00:00.000Z")).toBe("12 Aug 2026");
  });

  it("returns an empty string for a missing or unparseable date", () => {
    expect(formatPostDate()).toBe("");
    expect(formatPostDate("not-a-date")).toBe("");
  });
});

describe("toIsoDate", () => {
  it("normalises a published date to ISO", () => {
    expect(toIsoDate("2026-08-12T09:00:00.000Z")).toBe(
      "2026-08-12T09:00:00.000Z",
    );
  });

  it("returns an empty string when unparseable", () => {
    expect(toIsoDate("nope")).toBe("");
  });
});

describe("formatCategoryLabel", () => {
  it("title-cases a hyphenated category", () => {
    expect(formatCategoryLabel("behind-the-scenes")).toBe("Behind The Scenes");
  });

  it("handles underscores and stray whitespace", () => {
    expect(formatCategoryLabel("  new_music ")).toBe("New Music");
  });

  it("leaves an already-formatted category alone", () => {
    expect(formatCategoryLabel("Community")).toBe("Community");
  });
});

describe("estimateReadingTime", () => {
  it("rounds up to whole minutes", () => {
    const content = [
      {
        _type: "block",
        children: [{ text: Array.from({ length: 250 }, () => "word").join(" ") }],
      },
    ];

    expect(estimateReadingTime(content)).toBe(2);
  });

  it("ignores non-block content such as images", () => {
    const content = [
      { _type: "image" },
      { _type: "block", children: [{ text: "just a few words here" }] },
    ];

    expect(estimateReadingTime(content)).toBe(1);
  });

  it("never returns zero for empty or missing content", () => {
    expect(estimateReadingTime([])).toBe(1);
    expect(estimateReadingTime()).toBe(1);
  });
});

describe("pickFallbackTileVariant", () => {
  it("is stable for the same id", () => {
    expect(pickFallbackTileVariant("post-abc")).toBe(
      pickFallbackTileVariant("post-abc"),
    );
  });

  it("stays inside the three available colourways", () => {
    for (const id of ["a", "bb", "ccc", "dddd", "eeeee", "ffffff"]) {
      expect([0, 1, 2]).toContain(pickFallbackTileVariant(id));
    }
  });

  it("spreads a realistic set of ids across more than one variant", () => {
    const variants = new Set(
      ["post-1", "post-2", "post-3", "post-4", "post-5"].map(
        pickFallbackTileVariant,
      ),
    );

    expect(variants.size).toBeGreaterThan(1);
  });
});

describe("collectCategories", () => {
  it("de-duplicates and orders by frequency then name", () => {
    const posts = [
      { categories: ["music", "news"] },
      { categories: ["music"] },
      { categories: ["events"] },
      {},
    ];

    expect(collectCategories(posts)).toEqual(["music", "events", "news"]);
  });

  it("returns an empty list when nothing is categorised", () => {
    expect(collectCategories([{}, {}])).toEqual([]);
  });
});

describe("filterPostsByCategories", () => {
  const posts = [
    { id: "a", categories: ["music", "news"] },
    { id: "b", categories: ["music"] },
    { id: "c", categories: undefined },
  ];

  it("returns everything when nothing is selected", () => {
    expect(filterPostsByCategories(posts, [])).toHaveLength(3);
  });

  it("keeps only posts carrying every selected category", () => {
    expect(filterPostsByCategories(posts, ["music", "news"])).toEqual([
      posts[0],
    ]);
  });

  it("excludes uncategorised posts once a filter is active", () => {
    expect(filterPostsByCategories(posts, ["music"]).map((p) => p.id)).toEqual([
      "a",
      "b",
    ]);
  });
});
