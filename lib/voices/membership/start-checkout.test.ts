import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("@/lib/site-url", () => ({
  getBaseUrl: vi.fn(() => "https://staging.voicesradio.co.uk"),
}));

vi.mock("./membership-mutations", () => ({
  checkout: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { checkout } = await import("./membership-mutations");
const { startCheckout } = await import("./start-checkout");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("startCheckout", () => {
  it("returns a failure without calling the backend when no tier is chosen", async () => {
    const result = await startCheckout(undefined, "monthly");
    expect(result).toEqual({
      ok: false,
      message: "Choose a membership tier to continue.",
    });
    expect(checkout).not.toHaveBeenCalled();
  });

  it("returns a failure without calling the backend when cadence isn't monthly/annual", async () => {
    const result = await startCheckout("member", "biannually");
    expect(result.ok).toBe(false);
    expect(checkout).not.toHaveBeenCalled();
  });

  it("builds absolute success/cancel URLs and a fresh idempotency key, then redirects to Stripe on success", async () => {
    vi.mocked(checkout).mockResolvedValue({
      ok: true,
      data: { checkoutUrl: "https://checkout.stripe.com/cs_test_123", sessionId: "cs_test_123" },
    });

    await expect(startCheckout("member", "annual")).rejects.toThrow(RedirectSignal);

    expect(checkout).toHaveBeenCalledWith(
      {
        tierId: "member",
        cadence: "annual",
        successUrl: "https://staging.voicesradio.co.uk/join/complete",
        cancelUrl: "https://staging.voicesradio.co.uk/join?cadence=annual",
      },
      expect.any(String),
    );
    expect(redirect).toHaveBeenCalledWith("https://checkout.stripe.com/cs_test_123");
  });

  it("uses a different idempotency key on each call", async () => {
    vi.mocked(checkout).mockResolvedValue({
      ok: true,
      data: { checkoutUrl: "https://checkout.stripe.com/cs_1", sessionId: "cs_1" },
    });

    await expect(startCheckout("member", "monthly")).rejects.toThrow(RedirectSignal);
    const firstKey = vi.mocked(checkout).mock.calls[0][1];

    await expect(startCheckout("member", "monthly")).rejects.toThrow(RedirectSignal);
    const secondKey = vi.mocked(checkout).mock.calls[1][1];

    expect(firstKey).not.toBe(secondKey);
  });

  it("returns the backend's failure message without redirecting", async () => {
    vi.mocked(checkout).mockResolvedValue({
      ok: false,
      code: "PRICE_UNAVAILABLE",
      message: "Pricing is temporarily unavailable. Please try again shortly.",
    });

    const result = await startCheckout("member", "monthly");

    expect(result).toEqual({
      ok: false,
      message: "Pricing is temporarily unavailable. Please try again shortly.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
