import { describe, expect, it } from "vitest";
import type { VoicesArtist } from "./types";
import { filterArtistsByQuery, matchesArtistQuery } from "./artist-search";

function artist(
  overrides: Partial<VoicesArtist> & Pick<VoicesArtist, "id" | "name">,
): VoicesArtist {
  return { aliases: [], genres: [], ...overrides } as VoicesArtist;
}

const artists = [
  artist({ id: "1", name: "Arnie Wrong" }),
  artist({ id: "2", name: "Beyoncé" }),
  artist({ id: "3", name: "DJ Nightshift", aliases: ["The Night Owl"] }),
];

describe("matchesArtistQuery", () => {
  it("matches every artist for an empty or blank query", () => {
    expect(matchesArtistQuery(artists[0], "")).toBe(true);
    expect(matchesArtistQuery(artists[0], "   ")).toBe(true);
  });

  it("ignores case", () => {
    expect(matchesArtistQuery(artists[0], "ARNIE")).toBe(true);
  });

  it("matches a partial name", () => {
    expect(matchesArtistQuery(artists[0], "wro")).toBe(true);
  });

  it("matches an alias", () => {
    expect(matchesArtistQuery(artists[2], "night owl")).toBe(true);
  });

  it("ignores accents in the name and in the query", () => {
    expect(matchesArtistQuery(artists[1], "beyonce")).toBe(true);
    expect(matchesArtistQuery(artists[1], "beyoncé")).toBe(true);
  });

  it("does not match genres", () => {
    const techno = artist({ id: "4", name: "Host", genres: ["Techno"] });
    expect(matchesArtistQuery(techno, "techno")).toBe(false);
  });

  it("returns false when nothing matches", () => {
    expect(matchesArtistQuery(artists[0], "zzz")).toBe(false);
  });
});

describe("filterArtistsByQuery", () => {
  it("returns the same artists for an empty query", () => {
    expect(filterArtistsByQuery(artists, "")).toEqual(artists);
  });

  it("returns only matching artists and keeps their order", () => {
    expect(filterArtistsByQuery(artists, "n").map((a) => a.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(filterArtistsByQuery(artists, "arnie").map((a) => a.id)).toEqual([
      "1",
    ]);
  });

  it("does not mutate the input", () => {
    const copy = [...artists];
    filterArtistsByQuery(artists, "arnie");
    expect(artists).toEqual(copy);
  });
});
