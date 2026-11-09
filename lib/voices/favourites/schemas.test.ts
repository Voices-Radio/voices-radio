import { describe, expect, it } from "vitest";
import {
  favouriteListSchema,
  listsResponseSchema,
  statusResponseSchema,
  favouritesResponseSchema,
} from "./schemas";

describe("favouriteListSchema", () => {
  it("accepts a well-formed list", () => {
    const parsed = favouriteListSchema.safeParse({
      id: "507f1f77bcf86cd799439031",
      name: "My Favourites",
      isDefault: true,
      showCount: 0,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a negative showCount rather than silently clamping it", () => {
    const parsed = favouriteListSchema.safeParse({
      id: "x",
      name: "x",
      isDefault: false,
      showCount: -1,
      createdAt: "x",
      updatedAt: "x",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("listsResponseSchema", () => {
  it("accepts an empty lists array", () => {
    expect(listsResponseSchema.safeParse({ lists: [] }).success).toBe(true);
  });
});

describe("statusResponseSchema", () => {
  it("accepts a sparse statuses map — absent keys are simply unsaved", () => {
    const parsed = statusResponseSchema.safeParse({
      statuses: {
        "507f1f77bcf86cd799439021": { saved: true, listIds: ["507f1f77bcf86cd799439031"] },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects saved: false — the map only ever carries saved entries", () => {
    const parsed = statusResponseSchema.safeParse({
      statuses: { x: { saved: false, listIds: [] } },
    });
    expect(parsed.success).toBe(false);
  });
});

describe("favouritesResponseSchema", () => {
  it("accepts a null show — the deleted-show case routes/favourites.js still allows through in some rows", () => {
    const parsed = favouritesResponseSchema.safeParse({
      favourites: [
        {
          showId: "507f1f77bcf86cd799439021",
          show: null,
          listIds: [],
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      nextCursor: null,
    });
    expect(parsed.success).toBe(true);
  });

  it("does not require the embedded show to match any particular shape", () => {
    // Deliberately untyped here — see the module doc comment. This just
    // confirms an arbitrary object still parses as a record.
    const parsed = favouritesResponseSchema.safeParse({
      favourites: [
        {
          showId: "507f1f77bcf86cd799439021",
          show: { _id: "507f1f77bcf86cd799439021", title: "A Show", extra: 123 },
          listIds: [],
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      nextCursor: "507f1f77bcf86cd799439099",
    });
    expect(parsed.success).toBe(true);
  });
});
