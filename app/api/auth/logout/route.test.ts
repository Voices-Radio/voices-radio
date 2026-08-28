import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/voices/membership/session", () => ({
  authedFetch: vi.fn(),
  clearSessionCookies: vi.fn(),
}));

const { authedFetch, clearSessionCookies } = await import(
  "@/lib/voices/membership/session"
);
const { POST } = await import("./route");

function makeRequest(body?: unknown) {
  return new Request("http://localhost/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }) as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authedFetch).mockResolvedValue(new Response(null, { status: 200 }));
});

describe("POST /api/auth/logout", () => {
  it("clears cookies without touching other devices by default", async () => {
    const response = await POST(makeRequest({}));

    expect(await response.json()).toEqual({ ok: true, allDevices: false });
    expect(clearSessionCookies).toHaveBeenCalled();
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("treats an empty body as a single-device sign-out", async () => {
    const response = await POST(makeRequest());

    expect(await response.json()).toEqual({ ok: true, allDevices: false });
    expect(authedFetch).not.toHaveBeenCalled();
  });

  it("asks the backend to invalidate every session when allDevices is set", async () => {
    const response = await POST(makeRequest({ allDevices: true }));

    expect(await response.json()).toEqual({ ok: true, allDevices: true });
    expect(authedFetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allDevices: true }),
    });
    expect(clearSessionCookies).toHaveBeenCalled();
  });

  it("still signs this browser out when the backend call fails", async () => {
    // The cookies are what sign this browser out. Leaving a listener in a
    // signed-in shell because the API was down is the worse failure.
    vi.mocked(authedFetch).mockRejectedValue(new Error("network down"));

    const response = await POST(makeRequest({ allDevices: true }));

    expect(await response.json()).toEqual({ ok: true, allDevices: false });
    expect(clearSessionCookies).toHaveBeenCalled();
  });

  it("reports allDevices false when the backend refuses the request", async () => {
    vi.mocked(authedFetch).mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    const response = await POST(makeRequest({ allDevices: true }));

    expect(await response.json()).toEqual({ ok: true, allDevices: false });
    expect(clearSessionCookies).toHaveBeenCalled();
  });
});
