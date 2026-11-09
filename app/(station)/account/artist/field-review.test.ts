import { describe, expect, it } from "vitest";
import type { ArtistProfile } from "@/lib/voices/membership/schemas";
import { reviewByField, shownList, shownText } from "./field-review";

const review = (fields: object[]) =>
  ({
    id: "r1",
    submittedAt: "2026-10-20T10:00:00Z",
    pending: false,
    fields,
  }) as ArtistProfile["profileReview"];

describe("reviewByField", () => {
  it("is empty without a review", () => {
    expect(reviewByField(null)).toEqual({});
    expect(reviewByField(undefined)).toEqual({});
  });

  it("keys every backend field by its form input name", () => {
    const keys = [
      "showName",
      "bio",
      "imageUrl",
      "bannerUrl",
      "genres",
      "mixcloudUsername",
      "soundcloudUsername",
      "socialLinks.instagram",
      "socialLinks.website",
      "socialLinks.twitter",
      "socialLinks.facebook",
    ];
    const result = reviewByField(
      review(keys.map((field) => ({ field, proposed: "x", status: "approved" }))),
    );
    expect(Object.keys(result).sort()).toEqual(
      [
        "showName",
        "bio",
        "imageUrl",
        "bannerUrl",
        "genres",
        "mixcloudUsername",
        "soundcloudUsername",
        "instagram",
        "website",
        "twitter",
        "facebook",
      ].sort(),
    );
  });

  it("keeps the rejection reason", () => {
    const result = reviewByField(
      review([{ field: "bio", proposed: "x", status: "rejected", rejectionReason: "Too long" }]),
    );
    expect(result.bio).toEqual({ status: "rejected", reason: "Too long", proposed: "x" });
  });
});

describe("shownText", () => {
  it("shows the live value for an approved field", () => {
    expect(shownText({ status: "approved", reason: null, proposed: "new" }, "live")).toBe("live");
  });

  it("shows the proposal for a rejected or pending field", () => {
    expect(shownText({ status: "rejected", reason: "No", proposed: "new" }, "live")).toBe("new");
    expect(shownText({ status: "pending", reason: null, proposed: "new" }, null)).toBe("new");
  });

  it("falls back to the live value when the proposal is not text", () => {
    expect(shownText({ status: "rejected", reason: null, proposed: 42 }, "live")).toBe("live");
    expect(shownText(undefined, undefined)).toBeNull();
  });
});

describe("shownList", () => {
  it("shows a rejected genre list", () => {
    expect(shownList({ status: "rejected", reason: null, proposed: ["dub"] }, ["house"])).toEqual(["dub"]);
  });

  it("ignores a proposal that is not a list of strings", () => {
    expect(shownList({ status: "rejected", reason: null, proposed: [1] }, ["house"])).toEqual(["house"]);
    expect(shownList(undefined, ["house"])).toEqual(["house"]);
  });
});
