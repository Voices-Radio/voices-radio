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

vi.mock("@/lib/voices/membership/guest-checkout", () => ({
  guestCheckout: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { guestCheckout } = await import("@/lib/voices/membership/guest-checkout");
const { createAccountAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  firstName: "Jo",
  lastName: "Bloggs",
  email: "jo@example.com",
  amount: "599",
  cadence: "monthly",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(guestCheckout).mockResolvedValue({
    ok: true,
    data: { checkoutUrl: "https://checkout.stripe.com/cs_1", sessionId: "cs_1" },
  });
});

describe("createAccountAction (payment-first: details, then Stripe)", () => {
  it("asks for no password, and sends the visitor straight to Stripe", async () => {
    await expect(
      createAccountAction(undefined, formData(valid)),
    ).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("https://checkout.stripe.com/cs_1");
    expect(guestCheckout).toHaveBeenCalledWith({
      firstName: "Jo",
      lastName: "Bloggs",
      email: "jo@example.com",
      newsletters: false,
      memberUpdates: false,
      amountMinor: 599,
      cadence: "monthly",
      successUrl: "https://staging.voicesradio.co.uk/join/complete",
      cancelUrl:
        "https://staging.voicesradio.co.uk/join?cadence=monthly&checkout=cancelled",
    });
  });

  it("passes the two consents separately", async () => {
    await expect(
      createAccountAction(
        undefined,
        formData({ ...valid, newsletters: "on", memberUpdates: "on" }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(guestCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ newsletters: true, memberUpdates: true }),
    );
  });

  it("returns field errors, keeps what was typed, and never calls the backend", async () => {
    const state = await createAccountAction(
      undefined,
      formData({ ...valid, firstName: "", email: "nope" }),
    );

    expect(state).toMatchObject({
      status: "error",
      fieldErrors: {
        firstName: expect.stringMatching(/first name/i),
        email: expect.stringMatching(/valid email/i),
      },
      values: { lastName: "Bloggs", email: "nope" },
    });
    expect(guestCheckout).not.toHaveBeenCalled();
  });

  it("refuses to continue without a chosen amount, since payment is next", async () => {
    const state = await createAccountAction(
      undefined,
      formData({ ...valid, amount: "" }),
    );
    expect(state).toMatchObject({
      status: "error",
      formError: expect.stringMatching(/choose a contribution/i),
    });
    expect(guestCheckout).not.toHaveBeenCalled();
  });

  it("sends someone with an existing account to sign in rather than paying into it", async () => {
    vi.mocked(guestCheckout).mockResolvedValue({
      ok: false,
      code: "ACCOUNT_EXISTS",
      message: "exists",
    });
    const state = await createAccountAction(undefined, formData(valid));
    expect(state).toEqual({ status: "account_exists", email: "jo@example.com" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("tells someone who already paid that a new set-up link is on its way", async () => {
    vi.mocked(guestCheckout).mockResolvedValue({
      ok: false,
      code: "SETUP_PENDING",
      message: "pending",
    });
    const state = await createAccountAction(undefined, formData(valid));
    expect(state).toEqual({ status: "setup_pending", email: "jo@example.com" });
  });

  it("shows any other backend failure as a form error and keeps the input", async () => {
    vi.mocked(guestCheckout).mockResolvedValue({
      ok: false,
      code: "PRICE_UNAVAILABLE",
      message: "Pricing is temporarily unavailable.",
    });
    const state = await createAccountAction(undefined, formData(valid));
    expect(state).toMatchObject({
      status: "error",
      formError: "Pricing is temporarily unavailable.",
      values: { email: "jo@example.com" },
    });
  });
});
