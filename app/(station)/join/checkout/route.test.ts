import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

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

vi.mock("@/lib/voices/membership/session", () => ({
  requireSession: vi.fn(),
}));

vi.mock("@/lib/voices/membership/start-checkout", () => ({
  startCheckout: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { requireSession } = await import("@/lib/voices/membership/session");
const { startCheckout } =
  await import("@/lib/voices/membership/start-checkout");
const { GET } = await import("./route");

function requestWith(amount?: string, cadence?: string, source?: string) {
  const params = new URLSearchParams();
  if (amount) params.set("amount", amount);
  if (cadence) params.set("cadence", cadence);
  if (source) params.set("source", source);
  return new NextRequest(
    `https://staging.voicesradio.co.uk/join/checkout?${params.toString()}`,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue({ _id: "u1", email: "a@b.com" });
});

describe("GET /join/checkout", () => {
  it("guards the route with requireSession before doing anything else", async () => {
    // requireSession() throwing (its own redirect) must propagate — this
    // route must not swallow it and continue as if signed in.
    vi.mocked(requireSession).mockImplementation(() => {
      throw new RedirectSignal("/sign-in?next=%2Fjoin%2Fcheckout");
    });

    await expect(GET(requestWith("799", "monthly"))).rejects.toThrow(
      RedirectSignal,
    );
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it("passes the parsed amount/cadence straight through to startCheckout", async () => {
    vi.mocked(startCheckout).mockImplementation(() => {
      throw new RedirectSignal("https://checkout.stripe.com/cs_123");
    });

    await expect(GET(requestWith("799", "annual"))).rejects.toThrow(
      RedirectSignal,
    );

    expect(startCheckout).toHaveBeenCalledWith(799, "annual", undefined);
  });

  it("passes the reminder source through, and ignores any other value", async () => {
    vi.mocked(startCheckout).mockImplementation(() => {
      throw new RedirectSignal("https://checkout.stripe.com/cs_123");
    });

    await expect(GET(requestWith("599", "monthly", "reminder"))).rejects.toThrow(RedirectSignal);
    expect(startCheckout).toHaveBeenLastCalledWith(599, "monthly", "reminder");

    await expect(GET(requestWith("599", "monthly", "<script>"))).rejects.toThrow(RedirectSignal);
    expect(startCheckout).toHaveBeenLastCalledWith(599, "monthly", undefined);
  });

  it("passes undefined to startCheckout for a missing/invalid amount, rather than a bad number", async () => {
    vi.mocked(startCheckout).mockImplementation(() => {
      throw new RedirectSignal("https://checkout.stripe.com/cs_123");
    });

    await expect(GET(requestWith("not-a-number", "monthly"))).rejects.toThrow(
      RedirectSignal,
    );

    expect(startCheckout).toHaveBeenCalledWith(undefined, "monthly", undefined);
  });

  it("redirects to /join with the failure message when startCheckout fails", async () => {
    vi.mocked(startCheckout).mockResolvedValue({
      ok: false,
      message: "Pricing is temporarily unavailable. Please try again shortly.",
    });

    await expect(GET(requestWith("799", "monthly"))).rejects.toThrow(
      RedirectSignal,
    );

    expect(redirect).toHaveBeenCalledWith(
      "/join?checkoutError=Pricing%20is%20temporarily%20unavailable.%20Please%20try%20again%20shortly.",
    );
  });
});
