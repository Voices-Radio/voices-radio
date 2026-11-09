import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/voices/membership/guest-checkout", () => ({
  getGuestCheckoutStatus: vi.fn(),
}));

const { getGuestCheckoutStatus } = await import("@/lib/voices/membership/guest-checkout");
const { GET } = await import("./route");

const req = (qs = "") =>
  new NextRequest(`https://staging.voicesradio.co.uk/api/membership/guest-status${qs}`);

beforeEach(() => vi.clearAllMocks());

describe("GET /api/membership/guest-status", () => {
  it("returns the backend's answer, uncached", async () => {
    const data = { paid: true, sessionStatus: "complete", needsSetup: true, email: "j***@x.com" };
    vi.mocked(getGuestCheckoutStatus).mockResolvedValue({ ok: true, data } as never);

    const res = await GET(req("?session_id=cs_1"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(data);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(getGuestCheckoutStatus).toHaveBeenCalledWith("cs_1");
  });

  it("rejects a request with no session id", async () => {
    const res = await GET(req());
    expect(res.status).toBe(400);
    expect(getGuestCheckoutStatus).not.toHaveBeenCalled();
  });

  it("maps an unknown session to 404 and any other failure to 502", async () => {
    vi.mocked(getGuestCheckoutStatus).mockResolvedValueOnce({ ok: false, code: "NOT_FOUND", message: "x" });
    expect((await GET(req("?session_id=a"))).status).toBe(404);

    vi.mocked(getGuestCheckoutStatus).mockResolvedValueOnce({ ok: false, code: "NETWORK_ERROR", message: "x" });
    expect((await GET(req("?session_id=a"))).status).toBe(502);
  });
});
