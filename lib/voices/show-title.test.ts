import { describe, expect, it } from "vitest";
import { formatShowDisplayTitle } from "./show-title";

describe("formatShowDisplayTitle", () => {
  it("drops a trailing date and station name from an archive title", () => {
    expect(
      formatShowDisplayTitle("In Situ Show w/ DJoe - 02/09/26 - Voices Radio"),
    ).toBe("In Situ Show w/ DJoe");
  });

  it("drops the station name on its own", () => {
    expect(formatShowDisplayTitle("Night Tape - Voices Radio")).toBe(
      "Night Tape",
    );
  });

  it("drops a trailing date on its own", () => {
    expect(formatShowDisplayTitle("Night Tape - 02.09.2026")).toBe("Night Tape");
    expect(formatShowDisplayTitle("Night Tape - 2026-09-02")).toBe("Night Tape");
  });

  it("handles en and em dash separators", () => {
    expect(formatShowDisplayTitle("Night Tape – 02/09/26 — Voices Radio")).toBe(
      "Night Tape",
    );
  });

  it("keeps meaningful trailing segments", () => {
    expect(formatShowDisplayTitle("Night Tape - Guest Mix")).toBe(
      "Night Tape - Guest Mix",
    );
  });

  it("stops stripping at the first meaningful segment", () => {
    // The guest name must survive even though a date follows it.
    expect(
      formatShowDisplayTitle("Night Tape - Guest Mix - 02/09/26 - Voices Radio"),
    ).toBe("Night Tape - Guest Mix");
  });

  it("keeps show names that merely contain the word Voices", () => {
    expect(formatShowDisplayTitle("Voices at Night - 02/09/26")).toBe(
      "Voices at Night",
    );
  });

  it("never strips the title down to nothing", () => {
    expect(formatShowDisplayTitle("Voices Radio")).toBe("Voices Radio");
    expect(formatShowDisplayTitle("02/09/26")).toBe("02/09/26");
  });

  it("does not split on hyphens inside a word or date", () => {
    expect(formatShowDisplayTitle("Lo-Fi Sessions")).toBe("Lo-Fi Sessions");
  });

  it("trims surrounding whitespace and tolerates empty input", () => {
    expect(formatShowDisplayTitle("  Night Tape  ")).toBe("Night Tape");
    expect(formatShowDisplayTitle("")).toBe("");
  });
});
