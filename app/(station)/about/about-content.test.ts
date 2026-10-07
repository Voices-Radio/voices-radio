import { describe, expect, it } from "vitest";
import type { PortableTextBlock } from "sanity";
import { getBookingNames } from "./about-content";

const blocks = [
  {
    _type: "block",
    _key: "first",
    children: [
      { _type: "span", _key: "ada", text: "Ada" },
      { _type: "span", _key: "blank", text: "  " },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _type: "block",
    _key: "second",
    children: [{ _type: "span", _key: "bea", text: "Bea" }],
    markDefs: [],
    style: "normal",
  },
] as unknown as PortableTextBlock[];

describe("getBookingNames", () => {
  it("keeps each meaningful booking name once and in CMS order", () => {
    expect(getBookingNames(blocks)).toEqual(["Ada", "Bea"]);
  });

  it("returns an empty field when bookings are unavailable", () => {
    expect(getBookingNames(undefined)).toEqual([]);
  });
});
