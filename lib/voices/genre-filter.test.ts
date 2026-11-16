import { describe, expect, it } from "vitest";
import {
  MAX_SELECTED_GENRES,
  buildGenreHref,
  parseSelectedGenres,
  removeGenre,
  toggleGenre,
} from "./genre-filter";

describe("toggleGenre", () => {
  it("adds a genre that is not selected, keeping order", () => {
    expect(toggleGenre(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a genre that is already selected", () => {
    expect(toggleGenre(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("drops the oldest genre when adding past the cap", () => {
    expect(MAX_SELECTED_GENRES).toBe(3);
    expect(toggleGenre(["a", "b", "c"], "d")).toEqual(["b", "c", "d"]);
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

// Crawlers followed every genre combination on /explore (14–16 Nov 2026), and
// each unique URL cost an uncached render plus a backend query. Parsing bounds
// what a URL can ask for, however it was built.
describe("parseSelectedGenres", () => {
  const house = "House & Techno > House";
  const techno = "House & Techno > Techno";
  const jungle = "Bass, Breaks & Jungle";
  const ambient = "Ambient & Electronica";

  it("keeps valid genres in their given order", () => {
    expect(parseSelectedGenres([techno, house])).toEqual([techno, house]);
  });

  it("drops unknown genres", () => {
    expect(parseSelectedGenres(["not-a-genre", house])).toEqual([house]);
  });

  it("drops repeated genres", () => {
    expect(parseSelectedGenres([house, house, techno])).toEqual([house, techno]);
  });

  it("keeps only the first MAX_SELECTED_GENRES genres", () => {
    expect(parseSelectedGenres([house, techno, jungle, ambient])).toEqual([
      house,
      techno,
      jungle,
    ]);
  });
});
