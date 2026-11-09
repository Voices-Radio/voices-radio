import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./paths";

const FALLBACK = "/account";

describe("safeInternalPath", () => {
  it("passes through an ordinary internal path", () => {
    expect(safeInternalPath("/account/artist", FALLBACK)).toBe(
      "/account/artist",
    );
  });

  it("preserves query and hash", () => {
    expect(safeInternalPath("/join?tier=gold#tiers", FALLBACK)).toBe(
      "/join?tier=gold#tiers",
    );
  });

  it.each([undefined, null, ""])("falls back for %p", (value) => {
    expect(safeInternalPath(value, FALLBACK)).toBe(FALLBACK);
  });

  it("rejects an absolute off-site URL", () => {
    expect(safeInternalPath("https://evil.com/x", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeInternalPath("//evil.com", FALLBACK)).toBe(FALLBACK);
  });

  /**
   * The bug this guard originally had. WHATWG URL treats a backslash as a path
   * separator for special schemes, so `/\evil.com` resolves to `https://evil.com/`
   * even though it passes a naive `startsWith("/") && !startsWith("//")` check.
   */
  it.each([
    "/\\evil.com",
    "/\\/evil.com",
    "/\\\\evil.com",
    "\\/evil.com",
    "/\\evil.com/account",
  ])("rejects the backslash bypass %j", (value) => {
    expect(safeInternalPath(value, FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a scheme-bearing value that is not http(s)", () => {
    expect(safeInternalPath("javascript:alert(1)", FALLBACK)).toBe(FALLBACK);
  });

  it("strips a leading tab rather than resolving it away silently", () => {
    // `/\tevil` resolves to `/evil` — same origin, so allowed, but it must come
    // back normalised rather than carrying the control character onward.
    expect(safeInternalPath("/\tevil", FALLBACK)).toBe("/evil");
  });

  it("rejects a value with no leading slash", () => {
    expect(safeInternalPath("evil.com", FALLBACK)).toBe(FALLBACK);
  });
});
