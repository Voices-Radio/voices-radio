import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/voices/membership/membership-mutations", () => ({
  cancelMembership: vi.fn(),
  changeCadence: vi.fn(),
  createPortalSession: vi.fn(),
  downgrade: vi.fn(),
  previewChange: vi.fn(),
  resumeMembership: vi.fn(),
  upgrade: vi.fn(),
}));

vi.mock("@/lib/site-url", () => ({
  getBaseUrl: vi.fn(() => "https://staging.voicesradio.co.uk"),
}));

const { revalidatePath } = await import("next/cache");
const {
  cancelMembership,
  changeCadence,
  createPortalSession,
  downgrade,
  previewChange,
  resumeMembership,
  upgrade,
} = await import("@/lib/voices/membership/membership-mutations");
const {
  cancelAction,
  changeCadenceAction,
  downgradeAction,
  portalSessionAction,
  previewChangeAction,
  resumeAction,
  upgradeAction,
} = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
});

const KEY = "11111111-2222-4333-8444-555555555555";

describe("previewChangeAction", () => {
  it("returns the preview data on success without touching revalidatePath", async () => {
    vi.mocked(previewChange).mockResolvedValue({
      ok: true,
      data: { effectiveAt: "2027-01-01T00:00:00Z", priceMinor: 1500, description: "x" },
    });

    const result = await previewChangeAction({ action: "upgrade", toAmountMinor: 1599 });

    expect(result).toEqual({
      ok: true,
      data: { effectiveAt: "2027-01-01T00:00:00Z", priceMinor: 1500, description: "x" },
    });
    expect(previewChange).toHaveBeenCalledWith({ action: "upgrade", toAmountMinor: 1599 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns the failure message when the preview call fails", async () => {
    vi.mocked(previewChange).mockResolvedValue({
      ok: false,
      code: "NO_ACTIVE_MEMBERSHIP",
      message: "You don't have an active membership yet.",
    });

    const result = await previewChangeAction({ action: "cancel" });
    expect(result).toEqual({ ok: false, message: "You don't have an active membership yet." });
  });
});

describe("mutation actions", () => {
  it("upgradeAction revalidates /account and /account/membership on success", async () => {
    vi.mocked(upgrade).mockResolvedValue({
      ok: true,
      data: { applied: "immediate", contributionAmountMinor: 1599, cadence: "monthly", scheduledChange: null, unlockedBenefits: [] },
    });

    const result = await upgradeAction(1599, KEY);

    expect(result).toEqual({ ok: true });
    expect(upgrade).toHaveBeenCalledWith(1599, KEY);
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(revalidatePath).toHaveBeenCalledWith("/account/membership");
  });

  it("upgradeAction does not revalidate on failure and returns the message", async () => {
    vi.mocked(upgrade).mockResolvedValue({
      ok: false,
      code: "ALREADY_ON_TIER",
      message: "You're already at this amount.",
    });

    const result = await upgradeAction(1599, KEY);

    expect(result).toEqual({ ok: false, message: "You're already at this amount." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("forwards the caller-supplied idempotency key, so a retry is deduped upstream", async () => {
    vi.mocked(downgrade).mockResolvedValue({
      ok: true,
      data: { applied: "scheduled", contributionAmountMinor: 399, cadence: "monthly", scheduledChange: null },
    });

    await downgradeAction(399, KEY);
    await downgradeAction(399, KEY);

    expect(vi.mocked(downgrade).mock.calls[0][1]).toBe(KEY);
    expect(vi.mocked(downgrade).mock.calls[1][1]).toBe(KEY);
  });

  it("rejects a malformed idempotency key before calling the backend", async () => {
    await expect(downgradeAction(399, "")).rejects.toThrow("Invalid idempotency key.");
    await expect(cancelAction("x y!")).rejects.toThrow("Invalid idempotency key.");
    expect(downgrade).not.toHaveBeenCalled();
    expect(cancelMembership).not.toHaveBeenCalled();
  });

  it("changeCadenceAction forwards the target cadence", async () => {
    vi.mocked(changeCadence).mockResolvedValue({
      ok: true,
      data: { applied: "scheduled", contributionAmountMinor: 799, cadence: "annual", scheduledChange: null },
    });

    await changeCadenceAction("annual", KEY);
    expect(changeCadence).toHaveBeenCalledWith("annual", KEY);
  });

  it("cancelAction forwards an optional reason", async () => {
    vi.mocked(cancelMembership).mockResolvedValue({
      ok: true,
      data: { status: "cancelling", paidThroughAt: "2027-01-01T00:00:00Z" },
    });

    await cancelAction(KEY, "too expensive");
    expect(cancelMembership).toHaveBeenCalledWith("too expensive", KEY);
  });

  it("resumeAction reports failure without revalidating", async () => {
    vi.mocked(resumeMembership).mockResolvedValue({
      ok: false,
      code: "MEMBERSHIP_LAPSED",
      message: "Your membership has already ended, so it can't be resumed.",
    });

    const result = await resumeAction(KEY);

    expect(result).toEqual({
      ok: false,
      message: "Your membership has already ended, so it can't be resumed.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("portalSessionAction", () => {
  it("returns the portal URL, built with the account/membership return path", async () => {
    vi.mocked(createPortalSession).mockResolvedValue({
      ok: true,
      data: { url: "https://billing.stripe.com/session/abc" },
    });

    const result = await portalSessionAction();

    expect(result).toEqual({ ok: true, url: "https://billing.stripe.com/session/abc" });
    expect(createPortalSession).toHaveBeenCalledWith(
      "https://staging.voicesradio.co.uk/account/membership",
    );
  });

  it("returns the failure message when the portal session can't be created", async () => {
    vi.mocked(createPortalSession).mockResolvedValue({
      ok: false,
      code: "NO_ACTIVE_MEMBERSHIP",
      message: "You don't have an active membership yet.",
    });

    const result = await portalSessionAction();
    expect(result).toEqual({ ok: false, message: "You don't have an active membership yet." });
  });
});
