import { describe, expect, it } from "vitest";
import { matchesAllGenreKeys } from "./genre-taxonomy";

const TECHNO = "House & Techno > Techno";
const DUB = "Reggae, Dub & Dancehall > Dub";

describe("matchesAllGenreKeys", () => {
  it("matches everything when no keys are selected", () => {
    expect(matchesAllGenreKeys(["anything"], [])).toBe(true);
    expect(matchesAllGenreKeys([], [])).toBe(true);
  });

  it("never matches an item with no genres once a key is selected", () => {
    expect(matchesAllGenreKeys([], [TECHNO])).toBe(false);
  });

  it("matches a single key via its aliases", () => {
    expect(matchesAllGenreKeys(["Techno"], [TECHNO])).toBe(true);
    expect(matchesAllGenreKeys(["Jazz"], [TECHNO])).toBe(false);
  });

  it("requires the item to match every selected key (AND)", () => {
    expect(matchesAllGenreKeys(["Techno", "Dub"], [TECHNO, DUB])).toBe(true);
    expect(matchesAllGenreKeys(["Techno"], [TECHNO, DUB])).toBe(false);
  });

  it("matches a primary key when the item carries any of its subgenres", () => {
    expect(matchesAllGenreKeys(["Techno"], ["House & Techno"])).toBe(true);
  });
});
