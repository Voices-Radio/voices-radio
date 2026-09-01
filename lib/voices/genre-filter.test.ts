import { describe, expect, it } from "vitest";
import { buildGenreHref, removeGenre, toggleGenre } from "./genre-filter";

describe("toggleGenre", () => {
  it("adds a genre that is not selected, keeping order", () => {
    expect(toggleGenre(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a genre that is already selected", () => {
    expect(toggleGenre(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("does not mutate the input", () => {
    const input = ["a"];
    toggleGenre(input, "b");
    expect(input).toEqual(["a"]);
  });
});

describe("removeGenre", () => {
  it("drops the matching key only", () => {
    expect(removeGenre(["a", "b"], "a")).toEqual(["b"]);
  });

  it("is a no-op when the key is absent", () => {
    expect(removeGenre(["a", "b"], "z")).toEqual(["a", "b"]);
  });
});

describe("buildGenreHref", () => {
  it("returns the base path when nothing is selected", () => {
    expect(buildGenreHref("/explore", [])).toBe("/explore");
  });

  it("emits one repeated genre param per selection, in order", () => {
    expect(buildGenreHref("/artists", ["a", "b"])).toBe(
      "/artists?genre=a&genre=b",
    );
  });

  it("preserves non-empty extra params before the genres", () => {
    expect(
      buildGenreHref("/explore", ["a"], { category: "music", tab: undefined }),
    ).toBe("/explore?category=music&genre=a");
  });

  it("encodes special characters in keys", () => {
    expect(buildGenreHref("/explore", ["House & Techno > Techno"])).toBe(
      `/explore?genre=${encodeURIComponent("House & Techno > Techno")}`,
    );
  });
});
