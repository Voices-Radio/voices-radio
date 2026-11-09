import { describe, expect, it } from "vitest";
import { describeMembershipError } from "./errors";

describe("describeMembershipError", () => {
  it("returns member-facing copy for a known code, ignoring the backend message", () => {
    expect(describeMembershipError("CAPACITY_FULL", "raw backend text")).toBe(
      "This benefit has reached capacity.",
    );
  });

  it("distinguishes CAPACITY_FULL from RACE_LOST with different copy", () => {
    expect(describeMembershipError("CAPACITY_FULL")).not.toBe(
      describeMembershipError("RACE_LOST"),
    );
  });

  it("falls back to the backend's own message for an unrecognised code", () => {
    expect(describeMembershipError("SOME_NEW_CODE", "A specific backend message.")).toBe(
      "A specific backend message.",
    );
  });

  it("falls back to a generic message when the code is unknown and no backend message exists", () => {
    expect(describeMembershipError("SOME_NEW_CODE")).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("falls back to a generic message when code is undefined", () => {
    expect(describeMembershipError(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
