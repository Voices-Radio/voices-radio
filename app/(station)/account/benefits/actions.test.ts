import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/voices/membership/membership-mutations", () => ({
  redeemBenefit: vi.fn(),
}));

const { revalidatePath } = await import("next/cache");
const { redeemBenefit } = await import(
  "@/lib/voices/membership/membership-mutations"
);
const { redeemAction } = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("redeemAction", () => {
  it("passes the caller-provided idempotency key straight through, unmodified", async () => {
    vi.mocked(redeemBenefit).mockResolvedValue({
      ok: true,
      data: {
        id: "b1",
        slug: "studio-session",
        name: "Studio session",
        state: "claimed",
        capacityRemaining: null,
        action: null,
        availableFrom: null,
        expiresAt: null,
      },
    });

    await redeemAction("b1", "client-generated-key-123");

    expect(redeemBenefit).toHaveBeenCalledWith("b1", "client-generated-key-123");
  });

  it("revalidates the benefits, dashboard and redemptions pages on success", async () => {
    vi.mocked(redeemBenefit).mockResolvedValue({
      ok: true,
      data: {
        id: "b1",
        slug: "studio-session",
        name: "Studio session",
        state: "claimed",
        capacityRemaining: null,
        action: null,
        availableFrom: null,
        expiresAt: null,
      },
    });

    const result = await redeemAction("b1", "key-1");

    expect(result.ok).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/account/benefits");
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(revalidatePath).toHaveBeenCalledWith("/account/redemptions");
  });

  it("surfaces a distinct message for a lost capacity race without revalidating", async () => {
    vi.mocked(redeemBenefit).mockResolvedValue({
      ok: false,
      code: "RACE_LOST",
      message: "So close — someone else just claimed the last spot. Try the next one.",
    });

    const result = await redeemAction("b1", "key-1");

    expect(result).toEqual({
      ok: false,
      message: "So close — someone else just claimed the last spot. Try the next one.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("surfaces a distinct message for an already-full benefit", async () => {
    vi.mocked(redeemBenefit).mockResolvedValue({
      ok: false,
      code: "CAPACITY_FULL",
      message: "This benefit has reached capacity.",
    });

    const result = await redeemAction("b1", "key-1");
    expect(result).toEqual({ ok: false, message: "This benefit has reached capacity." });
  });
});
