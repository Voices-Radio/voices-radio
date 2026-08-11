import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./session", () => ({
  getAccessToken: vi.fn(),
}));

const { getAccessToken } = await import("./session");
const { getBenefits, getMembership, getProfile, getRedemptions, getTiers } =
  await import("./membership-client");

function mockFetchOnce(response: Response) {
  const fn = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) => response,
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

const validTier = {
  id: "member",
  name: "Member",
  monthlyPriceMinor: 800,
  annualPriceMinor: 8000,
  currency: "gbp",
  mostPopular: true,
  sortOrder: 2,
};

const validMembershipState = {
  status: "active",
  tierId: "member",
  cadence: "monthly",
  priceMinor: 800,
  currency: "gbp",
  renewsAt: "2027-01-01T00:00:00Z",
  paidThroughAt: "2027-01-01T00:00:00Z",
  scheduledChange: null,
  isFoundingMember: false,
  paymentIssue: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("getTiers", () => {
  it("fetches without an Authorization header — pricing is public", async () => {
    const fetchMock = mockFetchOnce(
      new Response(JSON.stringify({ tiers: [validTier] }), { status: 200 }),
    );

    const result = await getTiers();

    expect(result).toEqual({ ok: true, data: [validTier] });
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit)?.headers).toBeUndefined();
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it("returns INVALID_RESPONSE, not a thrown error, when the payload fails schema validation", async () => {
    mockFetchOnce(
      new Response(JSON.stringify({ tiers: [{ id: "member" }] }), {
        status: 200,
      }),
    );

    const result = await getTiers();
    expect(result).toMatchObject({ ok: false, code: "INVALID_RESPONSE" });
  });

  it("maps the backend's error envelope to member-facing copy on a non-ok response", async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          error: { code: "PRICE_UNAVAILABLE", message: "raw" },
        }),
        { status: 503 },
      ),
    );

    const result = await getTiers();
    expect(result).toEqual({
      ok: false,
      code: "PRICE_UNAVAILABLE",
      message: "Pricing is temporarily unavailable. Please try again shortly.",
    });
  });

  it("returns NETWORK_ERROR rather than throwing when fetch itself rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const result = await getTiers();
    expect(result).toMatchObject({ ok: false, code: "NETWORK_ERROR" });
  });

  it("rethrows a Next.js control-flow error (dynamic-usage bailout) instead of swallowing it", async () => {
    const controlFlowError = Object.assign(new Error("DYNAMIC_SERVER_USAGE"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw controlFlowError;
      }),
    );

    await expect(getTiers()).rejects.toBe(controlFlowError);
  });
});

describe("authenticated reads (getMembership/getBenefits/getRedemptions/getProfile)", () => {
  it("returns NO_SESSION without calling fetch when there's no access token", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await getMembership();

    expect(result).toMatchObject({ ok: false, code: "NO_SESSION" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getMembership attaches the bearer token and returns validated state", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const fetchMock = mockFetchOnce(
      new Response(JSON.stringify(validMembershipState), { status: 200 }),
    );

    const result = await getMembership();

    expect(result).toEqual({ ok: true, data: validMembershipState });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/membership/me"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token-123" },
      }),
    );
  });

  it("getBenefits unwraps the {benefits: [...]} envelope into a plain array", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const benefit = {
      id: "b1",
      slug: "shop-discount",
      name: "10% off Voices merch",
      state: "available",
      capacityRemaining: null,
      action: "claim",
      availableFrom: null,
      expiresAt: null,
    };
    mockFetchOnce(
      new Response(JSON.stringify({ benefits: [benefit] }), { status: 200 }),
    );

    expect(await getBenefits()).toEqual({ ok: true, data: [benefit] });
  });

  it("getBenefits propagates the error result unchanged on failure (no .benefits to unwrap)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    mockFetchOnce(new Response(null, { status: 500 }));

    const result = await getBenefits();
    expect(result.ok).toBe(false);
  });

  it("getRedemptions unwraps the {redemptions: [...]} envelope", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const redemption = {
      benefitName: "Studio session",
      status: "used",
      claimedAt: "2027-01-01T00:00:00Z",
      usedAt: "2027-01-02T00:00:00Z",
      expiresAt: null,
      instructions: null,
      code: "VOICES-AB12CD",
      terms: null,
    };
    mockFetchOnce(
      new Response(JSON.stringify({ redemptions: [redemption] }), {
        status: 200,
      }),
    );

    expect(await getRedemptions()).toEqual({ ok: true, data: [redemption] });
  });

  it("getProfile returns the profile object directly (no envelope to unwrap)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const profile = {
      displayName: "Ada",
      supporterWallOptIn: true,
      marketingConsent: false,
      address: null,
    };
    mockFetchOnce(new Response(JSON.stringify(profile), { status: 200 }));

    expect(await getProfile()).toEqual({ ok: true, data: profile });
  });

  it("does not attempt a token refresh on a 401 — that's requireSession()'s job, not this layer's", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("stale-token");
    const fetchMock = mockFetchOnce(new Response(null, { status: 401 }));

    const result = await getMembership();

    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
