import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
vi.mock("next/headers", () => ({ headers: () => headersMock() }));

const { backendClientHeaders } = await import("./backend-headers");

describe("backendClientHeaders", () => {
  afterEach(() => {
    delete process.env.WEBSITE_PROXY_SECRET;
    headersMock.mockReset();
  });

  it("forwards the visitor IP with the shared secret", async () => {
    process.env.WEBSITE_PROXY_SECRET = "a-long-enough-secret-value";
    headersMock.mockResolvedValue(new Headers({ "x-real-ip": "203.0.113.9" }));

    expect(await backendClientHeaders()).toEqual({
      "X-Voices-Client-IP": "203.0.113.9",
      "X-Voices-Proxy-Secret": "a-long-enough-secret-value",
    });
  });

  it("sends nothing when the secret is not configured (backend keeps keying on req.ip)", async () => {
    headersMock.mockResolvedValue(new Headers({ "x-real-ip": "203.0.113.9" }));
    expect(await backendClientHeaders()).toEqual({});
  });

  it("sends nothing when the visitor IP cannot be determined", async () => {
    process.env.WEBSITE_PROXY_SECRET = "a-long-enough-secret-value";
    headersMock.mockResolvedValue(new Headers());
    expect(await backendClientHeaders()).toEqual({});
  });

  it("degrades to no headers outside a request scope", async () => {
    process.env.WEBSITE_PROXY_SECRET = "a-long-enough-secret-value";
    headersMock.mockRejectedValue(new Error("called outside a request scope"));
    expect(await backendClientHeaders()).toEqual({});
  });
});
