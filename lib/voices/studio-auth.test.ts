import { afterEach, describe, expect, it, vi } from "vitest";
import { requireStudioUser } from "./studio-auth";

function request(headers: Record<string, string> = {}) {
  return new Request("https://example.test/api/voices/admin-show-search", {
    headers,
  });
}

function mockSanity(response: Partial<Response> & { json?: () => unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    json: response.json ?? (async () => ({ id: "user-1" })),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requireStudioUser", () => {
  it("rejects a request with no Authorization header", async () => {
    const fetchMock = mockSanity({});
    const result = await requireStudioUser(request());

    expect(result?.status).toBe(401);
    // Must not spend a round-trip validating an absent token.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a non-Bearer Authorization header", async () => {
    mockSanity({});
    const result = await requireStudioUser(
      request({ authorization: "Basic dXNlcjpwYXNz" }),
    );
    expect(result?.status).toBe(401);
  });

  it("rejects an empty Bearer token", async () => {
    const fetchMock = mockSanity({});
    const result = await requireStudioUser(
      request({ authorization: "Bearer    " }),
    );

    expect(result?.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a token Sanity does not recognise", async () => {
    mockSanity({ ok: false });
    const result = await requireStudioUser(
      request({ authorization: "Bearer bad-token" }),
    );
    expect(result?.status).toBe(401);
  });

  it("rejects a 200 response that carries no user id", async () => {
    mockSanity({ ok: true, json: async () => ({}) });
    const result = await requireStudioUser(
      request({ authorization: "Bearer shaped-wrong" }),
    );
    expect(result?.status).toBe(401);
  });

  it("accepts a token Sanity resolves to a user", async () => {
    const fetchMock = mockSanity({});
    const result = await requireStudioUser(
      request({ authorization: "Bearer good-token-accept" }),
    );

    expect(result).toBeNull();
    // Validation is project-scoped: a token valid for some other Sanity
    // project must not pass this gate.
    expect(fetchMock.mock.calls[0][0]).toContain(".api.sanity.io/");
    expect(fetchMock.mock.calls[0][0]).toContain("/users/me");
  });

  it("fails closed when the Sanity lookup throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await requireStudioUser(
      request({ authorization: "Bearer unreachable" }),
    );
    // Unlike rate limiting, auth must FAIL CLOSED.
    expect(result?.status).toBe(401);
  });

  it("does not re-validate a token it has already accepted", async () => {
    const fetchMock = mockSanity({});
    const headers = { authorization: "Bearer cached-token-unique" };

    expect(await requireStudioUser(request(headers))).toBeNull();
    expect(await requireStudioUser(request(headers))).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
