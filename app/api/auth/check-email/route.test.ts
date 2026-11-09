import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendCheckEmail: vi.fn(),
}));

const { backendCheckEmail } = await import("@/lib/voices/membership/auth-client");
const { POST } = await import("./route");

function request(body: unknown) {
  return new NextRequest("https://staging.voicesradio.co.uk/api/auth/check-email", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(backendCheckEmail).mockResolvedValue({
    ok: true,
    status: 200,
    payload: { exists: true, email: "member@example.com" },
  });
});

describe("POST /api/auth/check-email", () => {
  it("validates email before calling the backend", async () => {
    const response = await POST(request({ email: "not-an-email" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_INPUT");
    expect(backendCheckEmail).not.toHaveBeenCalled();
  });

  it("returns whether the account exists", async () => {
    const response = await POST(request({ email: "member@example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(backendCheckEmail).toHaveBeenCalledWith({
      email: "member@example.com",
    });
    expect(payload).toEqual({ exists: true, email: "member@example.com" });
  });
});
