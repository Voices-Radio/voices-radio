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

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendVerifyEmail: vi.fn(),
}));

vi.mock("@/lib/voices/membership/session", () => ({
  setSessionCookies: vi.fn(),
  setAccessTokenCookie: vi.fn(),
  getCapabilities: vi.fn(async () => null),
}));

const { backendVerifyEmail } = await import("@/lib/voices/membership/auth-client");
const { setSessionCookies, setAccessTokenCookie } = await import(
  "@/lib/voices/membership/session"
);
const { verifyEmailAction } = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyEmailAction", () => {
  it("signs the member in and carries on to checkout", async () => {
    vi.mocked(backendVerifyEmail).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    const next = "/join/checkout?amount=699&cadence=monthly";
    await expect(verifyEmailAction("tok", next)).rejects.toMatchObject({ url: next });

    expect(backendVerifyEmail).toHaveBeenCalledWith("tok");
    expect(setSessionCookies).toHaveBeenCalledWith({ token: "at", refreshToken: "rt" });
  });

  it("lands on the account when there is nowhere to resume", async () => {
    vi.mocked(backendVerifyEmail).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    await expect(verifyEmailAction("tok", undefined)).rejects.toMatchObject({ url: "/account" });
  });

  it("refuses an off-site next rather than redirecting to it", async () => {
    vi.mocked(backendVerifyEmail).mockResolvedValue({
      ok: true,
      status: 200,
      payload: { token: "at", refreshToken: "rt" },
    });

    await expect(verifyEmailAction("tok", "/\\evil.example")).rejects.toMatchObject({ url: "/account" });
  });

  it("still signs in, for an hour, if the backend returns no refresh token", async () => {
    vi.mocked(backendVerifyEmail).mockResolvedValue({ ok: true, status: 200, payload: { token: "at" } });

    await expect(verifyEmailAction("tok", undefined)).rejects.toBeInstanceOf(RedirectSignal);
    expect(setAccessTokenCookie).toHaveBeenCalledWith({ token: "at" });
    expect(setSessionCookies).not.toHaveBeenCalled();
  });

  it("explains a spent or expired link without signing anyone in", async () => {
    vi.mocked(backendVerifyEmail).mockResolvedValue({
      ok: false,
      status: 400,
      payload: { message: "Invalid or expired verification token" },
    });

    const result = await verifyEmailAction("tok", "/account");

    expect(result).toMatchObject({ status: "error" });
    expect(setSessionCookies).not.toHaveBeenCalled();
    expect(setAccessTokenCookie).not.toHaveBeenCalled();
  });

  it("does not call the backend without a token", async () => {
    const result = await verifyEmailAction("", undefined);
    expect(result).toMatchObject({ status: "error" });
    expect(backendVerifyEmail).not.toHaveBeenCalled();
  });
});
