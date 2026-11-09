import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/rate-limit", () => ({
  AUTH_RATE_LIMITS: { resendVerification: { name: "resend-verification" } },
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendResendVerification: vi.fn(),
}));
vi.mock("@/lib/voices/membership/verification-return", () => ({
  verificationReturnUrl: vi.fn(async (next: string) => `https://staging.voicesradio.co.uk/verify-email?next=${encodeURIComponent(next)}`),
}));

const { enforceRateLimit } = await import("@/lib/voices/rate-limit");
const { backendResendVerification } = await import("@/lib/voices/membership/auth-client");
const { POST } = await import("./route");

const post = (body: unknown) =>
  POST(
    new Request("https://staging.voicesradio.co.uk/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(body),
    }) as never,
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
});

describe("POST /api/auth/resend-verification", () => {
  it("asks the backend to resend, returning the member to where they were headed", async () => {
    vi.mocked(backendResendVerification).mockResolvedValue({ ok: true, status: 200, payload: {} });

    const res = await post({ email: "jo@example.com", next: "/join/checkout?amount=599&cadence=monthly" });

    expect(res.status).toBe(200);
    expect(backendResendVerification).toHaveBeenCalledWith({
      email: "jo@example.com",
      verificationReturnUrl:
        "https://staging.voicesradio.co.uk/verify-email?next=%2Fjoin%2Fcheckout%3Famount%3D599%26cadence%3Dmonthly",
    });
  });

  it("gives the same answer whether the address is unknown, already verified, or sent", async () => {
    const answers = [];
    for (const status of [200, 404, 400]) {
      vi.mocked(backendResendVerification).mockResolvedValue({ ok: status === 200, status, payload: {} });
      const res = await post({ email: "someone@example.com" });
      answers.push([res.status, await res.json()]);
    }
    expect(new Set(answers.map((a) => JSON.stringify(a))).size).toBe(1);
    expect(answers[0][0]).toBe(200);
  });

  it("refuses an off-site `next` rather than forwarding it", async () => {
    vi.mocked(backendResendVerification).mockResolvedValue({ ok: true, status: 200, payload: {} });
    await post({ email: "jo@example.com", next: "https://evil.example.com/" });
    expect(vi.mocked(backendResendVerification).mock.calls[0][0].verificationReturnUrl).toContain("next=%2Faccount");
  });

  it("reports a real failure so the visitor can retry", async () => {
    vi.mocked(backendResendVerification).mockResolvedValue({ ok: false, status: 503, payload: null });
    const res = await post({ email: "jo@example.com" });
    expect(res.status).toBe(502);
  });

  it("rejects a malformed email without calling the backend", async () => {
    const res = await post({ email: "nope" });
    expect(res.status).toBe(400);
    expect(backendResendVerification).not.toHaveBeenCalled();
  });

  it("stops when rate limited, before touching the backend", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(Response.json({}, { status: 429 }));
    const res = await post({ email: "jo@example.com" });
    expect(res.status).toBe(429);
    expect(backendResendVerification).not.toHaveBeenCalled();
  });
});
