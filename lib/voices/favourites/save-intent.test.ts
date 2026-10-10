import { describe, expect, it } from "vitest";
import {
  SAVE_ARTIST_PARAM,
  SAVE_SHOW_PARAM,
  signInHrefForSaveIntent,
} from "./save-intent";

describe("signInHrefForSaveIntent", () => {
  it("sends visitors to /sign-in with the page and intended save as next", () => {
    expect(
      signInHrefForSaveIntent("/artists", "", SAVE_ARTIST_PARAM, "abc"),
    ).toBe(`/sign-in?next=${encodeURIComponent("/artists?saveArtist=abc")}`);
  });

  it("keeps existing filters on the page they return to", () => {
    expect(
      signInHrefForSaveIntent("/artists", "?genre=disco", SAVE_ARTIST_PARAM, "abc"),
    ).toBe(
      `/sign-in?next=${encodeURIComponent("/artists?genre=disco&saveArtist=abc")}`,
    );
  });

  it("supports the show bookmark param", () => {
    expect(signInHrefForSaveIntent("/shows", "", SAVE_SHOW_PARAM, "s1")).toBe(
      `/sign-in?next=${encodeURIComponent("/shows?save=s1")}`,
    );
  });
});
