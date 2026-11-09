import { describe, expect, it } from "vitest";
import { readEmailFromMailto } from "./mailto";

describe("readEmailFromMailto", () => {
  it("reads a plain address", () => {
    expect(readEmailFromMailto("mailto:info@voicesradio.co.uk")).toBe(
      "info@voicesradio.co.uk",
    );
  });

  it("drops a query string", () => {
    expect(
      readEmailFromMailto("mailto:info@voicesradio.co.uk?subject=Hello%20there"),
    ).toBe("info@voicesradio.co.uk");
  });

  it("decodes an escaped address", () => {
    expect(readEmailFromMailto("mailto:info%40voicesradio.co.uk")).toBe(
      "info@voicesradio.co.uk",
    );
  });

  it("accepts an upper case scheme", () => {
    expect(readEmailFromMailto("MAILTO:info@voicesradio.co.uk")).toBe(
      "info@voicesradio.co.uk",
    );
  });

  it("returns null for a page link", () => {
    expect(readEmailFromMailto("/chat")).toBeNull();
  });

  it("returns null for a missing or empty link", () => {
    expect(readEmailFromMailto(null)).toBeNull();
    expect(readEmailFromMailto(undefined)).toBeNull();
    expect(readEmailFromMailto("mailto:")).toBeNull();
  });
});
