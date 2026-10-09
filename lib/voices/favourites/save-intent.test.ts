import { describe, expect, it } from "vitest";
import {
  SAVE_ARTIST_PARAM,
  SAVE_SHOW_PARAM,
  joinHrefForSaveIntent,
} from "./save-intent";

describe("joinHrefForSaveIntent", () => {
  it("sends visitors to /join with the page and intended save as next", () => {
    expect(
      joinHrefForSaveIntent("/artists", "", SAVE_ARTIST_PARAM, "abc"),
    ).toBe(`/join?next=${encodeURIComponent("/artists?saveArtist=abc")}`);
  });

  it("keeps existing filters on the page they return to", () => {
    expect(
      joinHrefForSaveIntent("/artists", "?genre=disco", SAVE_ARTIST_PARAM, "abc"),
    ).toBe(
      `/join?next=${encodeURIComponent("/artists?genre=disco&saveArtist=abc")}`,
    );
  });

  it("supports the show bookmark param", () => {
    expect(joinHrefForSaveIntent("/shows", "", SAVE_SHOW_PARAM, "s1")).toBe(
      `/join?next=${encodeURIComponent("/shows?save=s1")}`,
    );
  });
});
