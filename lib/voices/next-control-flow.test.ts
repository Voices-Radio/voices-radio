import { describe, expect, it } from "vitest";
import { isNextControlFlowError } from "./next-control-flow";

describe("isNextControlFlowError", () => {
  it("recognises an Error with a string digest (redirect/notFound/dynamic-usage)", () => {
    const error = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;/sign-in",
    });
    expect(isNextControlFlowError(error)).toBe(true);
  });

  it("rejects a plain Error with no digest", () => {
    expect(isNextControlFlowError(new Error("network down"))).toBe(false);
  });

  it("rejects non-object values", () => {
    expect(isNextControlFlowError("nope")).toBe(false);
    expect(isNextControlFlowError(null)).toBe(false);
    expect(isNextControlFlowError(undefined)).toBe(false);
  });

  it("rejects an object with a non-string digest", () => {
    expect(isNextControlFlowError({ digest: 42 })).toBe(false);
  });
});
