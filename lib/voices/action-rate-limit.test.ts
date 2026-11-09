import { beforeEach, describe, expect, it, vi } from "vitest";

const checkRateLimit = vi.fn();
vi.mock("./rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimit(...args),
  RATE_LIMITED_MESSAGE: "Too many attempts.",
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-real-ip": "203.0.113.9" }),
}));
vi.unmock("@/lib/voices/action-rate-limit");

const { actionRateLimited } = await import("./action-rate-limit");

describe("actionRateLimited", () => {
  beforeEach(() => checkRateLimit.mockReset());

  it("returns null when under the limit", async () => {
    checkRateLimit.mockResolvedValue({ limited: false });
    expect(await actionRateLimited({ name: "x", limit: 1, window: "1 m" })).toBeNull();
  });

  it("returns the user-facing message when limited, keyed off request headers", async () => {
    checkRateLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 30 });
    const rule = { name: "x", limit: 1, window: "1 m" } as const;

    expect(await actionRateLimited(rule)).toBe("Too many attempts.");
    expect(checkRateLimit.mock.calls[0][0].get("x-real-ip")).toBe("203.0.113.9");
    expect(checkRateLimit.mock.calls[0][1]).toBe(rule);
  });
});
