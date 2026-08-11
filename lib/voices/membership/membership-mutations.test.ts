import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./session", () => ({
  authedFetch: vi.fn(),
}));

const { authedFetch } = await import("./session");
const {
  cancelMembership,
  changeCadence,
  checkout,
  createPortalSession,
  downgrade,
  previewChange,
  redeemBenefit,
  resumeMembership,
  updateProfile,
  upgrade,
} = await import("./membership-mutations");

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function headersOf(call: unknown[]) {
  const init = call[1] as RequestInit | undefined;
  return (init?.headers ?? {}) as Record<string, string>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkout", () => {
  it("sends the Idempotency-Key header and returns the parsed checkoutUrl", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ checkoutUrl: "https://checkout.stripe.com/cs_1", sessionId: "cs_1" }),
    );

    const result = await checkout(
      { tierId: "member", cadence: "monthly", successUrl: "https://x/join/complete", cancelUrl: "https://x/join" },
      "key-abc",
    );

    expect(result).toEqual({
      ok: true,
      data: { checkoutUrl: "https://checkout.stripe.com/cs_1", sessionId: "cs_1" },
    });
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(call[0]).toBe("/api/membership/checkout");
    expect(headersOf(call)["Idempotency-Key"]).toBe("key-abc");
  });

  it("maps a non-ok response to the error envelope", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ error: { code: "INVALID_REDIRECT_URL", message: "raw" } }, 400),
    );

    const result = await checkout(
      { tierId: "member", cadence: "monthly", successUrl: "x", cancelUrl: "x" },
      "key",
    );
    expect(result).toMatchObject({ ok: false, code: "INVALID_REDIRECT_URL" });
  });
});

describe("previewChange", () => {
  it("does NOT send an Idempotency-Key header — preview has no side effect", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ effectiveAt: "2027-01-01T00:00:00Z", priceMinor: 1500, description: "x" }),
    );

    await previewChange({ action: "upgrade", toTierId: "insider" });

    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(headersOf(call)["Idempotency-Key"]).toBeUndefined();
  });
});

describe("upgrade / downgrade / changeCadence / cancelMembership / resumeMembership", () => {
  it("upgrade hits /api/membership/upgrade with {toTierId} and the idempotency key", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ applied: "immediate", tierId: "insider", cadence: "monthly", scheduledChange: null, unlockedBenefits: [] }),
    );

    await upgrade("insider", "key-1");

    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(call[0]).toBe("/api/membership/upgrade");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({ toTierId: "insider" });
    expect(headersOf(call)["Idempotency-Key"]).toBe("key-1");
  });

  it("downgrade hits /api/membership/downgrade and parses the scheduled-change response", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({
        applied: "scheduled",
        tierId: "member",
        cadence: "monthly",
        scheduledChange: { type: "downgrade", toTierId: "supporter", effectiveAt: "2027-02-01T00:00:00Z" },
      }),
    );

    const result = await downgrade("supporter", "key-2");
    expect(result.ok).toBe(true);
  });

  it("changeCadence sends {toCadence}", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ applied: "scheduled", tierId: "member", cadence: "annual", scheduledChange: null }),
    );

    await changeCadence("annual", "key-3");
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({ toCadence: "annual" });
  });

  it("cancelMembership omits `reason` from the body when not provided", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ status: "cancelling", paidThroughAt: "2027-01-01T00:00:00Z" }),
    );

    await cancelMembership(undefined, "key-4");
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({});
  });

  it("cancelMembership includes `reason` when provided", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ status: "cancelling", paidThroughAt: "2027-01-01T00:00:00Z" }),
    );

    await cancelMembership("too expensive", "key-5");
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      reason: "too expensive",
    });
  });

  it("resumeMembership parses {status: 'active'}", async () => {
    vi.mocked(authedFetch).mockResolvedValue(response({ status: "active" }));
    const result = await resumeMembership("key-6");
    expect(result).toEqual({ ok: true, data: { status: "active" } });
  });
});

describe("createPortalSession", () => {
  it("omits the body key when no returnUrl is given", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ url: "https://billing.stripe.com/session/abc" }),
    );

    await createPortalSession(undefined);
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({});
  });

  it("includes returnUrl when given, with no Idempotency-Key (viewing the portal isn't a mutation)", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ url: "https://billing.stripe.com/session/abc" }),
    );

    await createPortalSession("https://x/account/membership");
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      returnUrl: "https://x/account/membership",
    });
    expect(headersOf(call)["Idempotency-Key"]).toBeUndefined();
  });
});

describe("redeemBenefit", () => {
  it("sends the idempotency key in the BODY, not a header — a different mechanism from every other mutation here", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({
        id: "b1",
        slug: "shop-discount",
        name: "10% off",
        state: "claimed",
        capacityRemaining: null,
        action: null,
        availableFrom: null,
        expiresAt: null,
      }),
    );

    await redeemBenefit("b1", "client-key-xyz");

    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(call[0]).toBe("/api/membership/benefits/b1/redeem");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      idempotencyKey: "client-key-xyz",
    });
    expect(headersOf(call)["Idempotency-Key"]).toBeUndefined();
  });

  it("URL-encodes the benefit id", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({
        id: "b/1",
        slug: "shop-discount",
        name: "10% off",
        state: "claimed",
        capacityRemaining: null,
        action: null,
        availableFrom: null,
        expiresAt: null,
      }),
    );

    await redeemBenefit("b/1 weird", "key");
    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(call[0]).toBe("/api/membership/benefits/b%2F1%20weird/redeem");
  });

  it("surfaces distinct error codes for CAPACITY_FULL vs RACE_LOST", async () => {
    vi.mocked(authedFetch).mockResolvedValueOnce(
      response({ error: { code: "CAPACITY_FULL", message: "raw" } }, 409),
    );
    const capacityResult = await redeemBenefit("b1", "key-a");
    expect(capacityResult).toMatchObject({ ok: false, code: "CAPACITY_FULL" });

    vi.mocked(authedFetch).mockResolvedValueOnce(
      response({ error: { code: "RACE_LOST", message: "raw" } }, 409),
    );
    const raceResult = await redeemBenefit("b1", "key-b");
    expect(raceResult).toMatchObject({ ok: false, code: "RACE_LOST" });
    expect(capacityResult).not.toEqual(raceResult);
  });
});

describe("updateProfile", () => {
  it("PATCHes /api/membership/profile with the given fields", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      response({ displayName: "Ada", supporterWallOptIn: true, marketingConsent: false, address: null }),
    );

    await updateProfile({ displayName: "Ada", supporterWallOptIn: true, marketingConsent: false });

    const call = vi.mocked(authedFetch).mock.calls[0];
    expect(call[0]).toBe("/api/membership/profile");
    expect((call[1] as RequestInit).method).toBe("PATCH");
  });
});

describe("error handling shared across all mutations", () => {
  it("returns INVALID_RESPONSE, not a throw, when the backend's success payload fails schema validation", async () => {
    vi.mocked(authedFetch).mockResolvedValue(response({ totally: "wrong shape" }));

    const result = await upgrade("insider", "key");
    expect(result).toMatchObject({ ok: false, code: "INVALID_RESPONSE" });
  });

  it("returns NETWORK_ERROR rather than throwing when authedFetch itself rejects", async () => {
    vi.mocked(authedFetch).mockRejectedValue(new Error("network down"));

    const result = await upgrade("insider", "key");
    expect(result).toMatchObject({ ok: false, code: "NETWORK_ERROR" });
  });

  it("rethrows a Next.js control-flow error instead of swallowing it into NETWORK_ERROR", async () => {
    const controlFlowError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;/sign-in",
    });
    vi.mocked(authedFetch).mockRejectedValue(controlFlowError);

    await expect(upgrade("insider", "key")).rejects.toBe(controlFlowError);
  });
});
