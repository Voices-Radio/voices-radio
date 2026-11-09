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

vi.mock("@/lib/voices/membership/guest-checkout", () => ({
  resumeCheckout: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { resumeCheckout } = await import("@/lib/voices/membership/guest-checkout");
const { resumeCheckoutAction } = await import("./actions");

function formData(token?: string) {
  const data = new FormData();
  if (token !== undefined) data.set("token", token);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(resumeCheckout).mockResolvedValue({
    ok: true,
    data: { checkoutUrl: "https://checkout.stripe.com/cs_2" },
  });
});

describe("resumeCheckoutAction (reminder email → Stripe)", () => {
  it("sends the visitor straight to a fresh Stripe checkout", async () => {
    await expect(
      resumeCheckoutAction(undefined, formData("tok")),
    ).rejects.toThrow(RedirectSignal);

    expect(resumeCheckout).toHaveBeenCalledWith("tok");
    expect(redirect).toHaveBeenCalledWith("https://checkout.stripe.com/cs_2");
  });

  it("calls nothing without a token", async () => {
    const state = await resumeCheckoutAction(undefined, formData());
    expect(state).toEqual({ status: "link_invalid" });
    expect(resumeCheckout).not.toHaveBeenCalled();
  });

  it.each([
    ["LINK_INVALID", { status: "link_invalid" }],
    ["ACCOUNT_EXISTS", { status: "account_exists" }],
    ["SETUP_PENDING", { status: "setup_pending" }],
  ])("maps %s to its own page state", async (code, expected) => {
    vi.mocked(resumeCheckout).mockResolvedValue({ ok: false, code, message: "x" });
    expect(await resumeCheckoutAction(undefined, formData("tok"))).toEqual(expected);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("shows the backend's message for anything else, so the visitor can retry", async () => {
    vi.mocked(resumeCheckout).mockResolvedValue({
      ok: false,
      code: "NETWORK_ERROR",
      message: "We couldn't reach the server.",
    });
    expect(await resumeCheckoutAction(undefined, formData("tok"))).toEqual({
      status: "error",
      message: "We couldn't reach the server.",
    });
  });
});
