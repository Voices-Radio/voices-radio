import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const isValidSignature = vi.fn();

vi.mock("next/cache", () => ({ revalidateTag: (tag: string) => revalidateTag(tag) }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "sanity-webhook-signature": "sig", "content-length": "20" }),
}));
vi.mock("@sanity/webhook", () => ({
  SIGNATURE_HEADER_NAME: "sanity-webhook-signature",
  isValidSignature: (...args: unknown[]) => isValidSignature(...args),
}));
vi.mock("@/env", () => ({ env: { SANITY_REVALIDATE_SECRET: "secret" } }));
vi.mock("@/lib/voices/rate-limit", () => ({
  enforceRateLimit: async () => null,
  PUBLIC_RATE_LIMITS: { revalidate: {} },
}));

const { POST } = await import("./route");

function request(body: string) {
  return new Request("https://site.test/api/revalidate", {
    method: "POST",
    body,
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockReset();
    isValidSignature.mockReset();
  });

  it("expires the shared sanity tag for a correctly signed publish of any type", async () => {
    isValidSignature.mockReturnValue(true);

    const response = await POST(request(JSON.stringify({ _type: "mainBlog" })));

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("sanity");
  });

  it("rejects a bad signature without revalidating", async () => {
    isValidSignature.mockReturnValue(false);

    const response = await POST(request(JSON.stringify({ _type: "home" })));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 500 (so Sanity retries) on a malformed signed body", async () => {
    isValidSignature.mockReturnValue(true);

    const response = await POST(request("{not json"));

    expect(response.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
