import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieRecord = { value: string };
const cookieStore = new Map<string, CookieRecord>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => {
      cookieStore.set(name, { value });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  })),
}));

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

const { redirect } = await import("next/navigation");
const {
  authedFetch,
  clearSessionCookies,
  getCapabilities,
  getSession,
  requireSession,
  setSessionCookies,
} = await import("./session");

function mockFetchOnce(response: Response) {
  const fn = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) => response,
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

function mockFetchSequence(responses: Response[]) {
  let call = 0;
  const fn = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) =>
      responses[call++],
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

async function waitForCondition(assertion: () => void) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      assertion();
      return;
    } catch {
      await Promise.resolve();
    }
  }

  assertion();
}

beforeEach(() => {
  cookieStore.clear();
  vi.unstubAllGlobals();
});

describe("getSession", () => {
  it("returns null when there's no access token cookie", async () => {
    expect(await getSession()).toBeNull();
  });

  it("returns the user when the backend validates the token", async () => {
    cookieStore.set("voices_at", { value: "valid-token" });
    const fetchMock = mockFetchOnce(
      new Response(JSON.stringify({ user: { _id: "u1", email: "a@b.com" } }), {
        status: 200,
      }),
    );

    expect(await getSession()).toEqual({ _id: "u1", email: "a@b.com" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/validate"),
      expect.objectContaining({
        headers: { Authorization: "Bearer valid-token" },
      }),
    );
  });

  it("returns null when the backend rejects the token (expired/invalid)", async () => {
    cookieStore.set("voices_at", { value: "expired-token" });
    mockFetchOnce(new Response(null, { status: 401 }));

    expect(await getSession()).toBeNull();
  });

  it("returns null rather than throwing when the request errors", async () => {
    cookieStore.set("voices_at", { value: "token" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(getSession()).resolves.toBeNull();
  });
});

describe("getCapabilities", () => {
  it("returns null when the visitor has no access token", async () => {
    expect(await getCapabilities()).toBeNull();
  });

  it("returns the parsed capabilities payload on success", async () => {
    cookieStore.set("voices_at", { value: "valid-token" });
    const fetchMock = mockFetchOnce(
      new Response(
        JSON.stringify({
          user: { _id: "u1", email: "dj@example.com", role: "presenter" },
          capabilities: ["artist", "member"],
          artist: {
            id: "artist-1",
            name: "DJ Test",
            imageUrl: "https://example.com/dj.jpg",
            programmingEmail: "dj@example.com",
            radioCultArtistId: "rc-1",
            radioCultSyncState: "linked",
            canManageProfile: true,
          },
          member: {
            status: "active",
            tierId: "insider",
            cadence: "monthly",
          },
        }),
        { status: 200 },
      ),
    );

    expect(await getCapabilities()).toMatchObject({
      capabilities: ["artist", "member"],
      artist: { id: "artist-1", canManageProfile: true },
      member: { status: "active", tierId: "insider" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/capabilities"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
        }),
      }),
    );
  });

  it("returns null when the capabilities endpoint rejects the session", async () => {
    cookieStore.set("voices_at", { value: "expired-token" });
    mockFetchOnce(new Response(null, { status: 401 }));

    expect(await getCapabilities()).toBeNull();
  });

  it("returns null rather than throwing when the request errors", async () => {
    cookieStore.set("voices_at", { value: "token" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(getCapabilities()).resolves.toBeNull();
  });
});

describe("setSessionCookies / clearSessionCookies", () => {
  it("stores both tokens and clears them on logout", async () => {
    await setSessionCookies({ token: "access-1", refreshToken: "refresh-1" });

    expect(cookieStore.get("voices_at")?.value).toBe("access-1");
    expect(cookieStore.get("voices_rt")?.value).toBe("refresh-1");

    await clearSessionCookies();

    expect(cookieStore.has("voices_at")).toBe(false);
    expect(cookieStore.has("voices_rt")).toBe(false);
  });
});

describe("authedFetch", () => {
  it("attaches the access token and returns the response on success", async () => {
    cookieStore.set("voices_at", { value: "good-token" });
    const fetchMock = mockFetchOnce(new Response("ok", { status: 200 }));

    const response = await authedFetch("/api/membership/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/membership/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer good-token",
        }),
      }),
    );
  });

  it("refreshes once on a 401, rotates cookies, and retries the original request", async () => {
    cookieStore.set("voices_at", { value: "stale-token" });
    cookieStore.set("voices_rt", { value: "refresh-token" });

    const fetchMock = mockFetchSequence([
      new Response(null, { status: 401 }), // first attempt with stale token
      new Response(
        JSON.stringify({ token: "fresh-token", refreshToken: "fresh-refresh" }),
        { status: 200 },
      ), // POST /api/auth/refresh
      new Response("ok", { status: 200 }), // retried original request
    ]);

    const response = await authedFetch("/api/membership/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(cookieStore.get("voices_at")?.value).toBe("fresh-token");
    expect(cookieStore.get("voices_rt")?.value).toBe("fresh-refresh");

    // The retried call must use the rotated access token, not the stale one.
    const retryCall = fetchMock.mock.calls[2];
    expect((retryCall[1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer fresh-token",
    });
  });

  it("clears cookies and returns the 401 when the refresh token is also dead", async () => {
    cookieStore.set("voices_at", { value: "stale-token" });
    cookieStore.set("voices_rt", { value: "dead-refresh-token" });

    mockFetchSequence([
      new Response(null, { status: 401 }), // original request
      new Response(null, { status: 401 }), // refresh attempt also fails
    ]);

    const response = await authedFetch("/api/membership/me");

    expect(response.status).toBe(401);
    expect(cookieStore.has("voices_at")).toBe(false);
    expect(cookieStore.has("voices_rt")).toBe(false);
  });

  it("does not attempt a refresh when there's no refresh token to use", async () => {
    cookieStore.set("voices_at", { value: "stale-token" });
    // no voices_rt cookie set

    const fetchMock = mockFetchOnce(new Response(null, { status: 401 }));

    const response = await authedFetch("/api/membership/me");

    expect(response.status).toBe(401);
    // Only the original request — no refresh call attempted.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not share an in-flight refresh between different refresh tokens", async () => {
    const refreshA = deferred<Response>();
    const refreshB = deferred<Response>();
    const refreshCalls: string[] = [];
    const membershipCalls: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const href = String(url);
        const authorization = String(
          (init?.headers as Record<string, string> | undefined)
            ?.Authorization ?? "",
        );

        if (href.includes("/api/auth/refresh")) {
          refreshCalls.push(authorization);
          return authorization === "Bearer refresh-a"
            ? refreshA.promise
            : refreshB.promise;
        }

        membershipCalls.push(authorization);
        return authorization === "Bearer fresh-a" ||
          authorization === "Bearer fresh-b"
          ? new Response("ok", { status: 200 })
          : new Response(null, { status: 401 });
      }),
    );

    cookieStore.set("voices_at", { value: "stale-a" });
    cookieStore.set("voices_rt", { value: "refresh-a" });
    const requestA = authedFetch("/api/membership/me");

    await waitForCondition(() => {
      expect(refreshCalls).toEqual(["Bearer refresh-a"]);
    });

    cookieStore.set("voices_at", { value: "stale-b" });
    cookieStore.set("voices_rt", { value: "refresh-b" });
    const requestB = authedFetch("/api/membership/me");

    await waitForCondition(() => {
      expect(refreshCalls).toEqual(["Bearer refresh-a", "Bearer refresh-b"]);
    });

    refreshB.resolve(
      new Response(
        JSON.stringify({ token: "fresh-b", refreshToken: "rotated-b" }),
        { status: 200 },
      ),
    );
    refreshA.resolve(
      new Response(
        JSON.stringify({ token: "fresh-a", refreshToken: "rotated-a" }),
        { status: 200 },
      ),
    );

    await expect(requestA).resolves.toHaveProperty("status", 200);
    await expect(requestB).resolves.toHaveProperty("status", 200);
    expect(membershipCalls).toContain("Bearer fresh-a");
    expect(membershipCalls).toContain("Bearer fresh-b");
  });
});

describe("requireSession", () => {
  it("returns the user directly when there's already a valid access token", async () => {
    cookieStore.set("voices_at", { value: "valid-token" });
    mockFetchOnce(
      new Response(JSON.stringify({ user: { _id: "u1", email: "a@b.com" } }), {
        status: 200,
      }),
    );

    expect(await requireSession("/account")).toEqual({
      _id: "u1",
      email: "a@b.com",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects through /api/auth/refresh (not /sign-in) when a refresh token exists but the access token is missing", async () => {
    cookieStore.set("voices_rt", { value: "refresh-token" });

    await expect(requireSession("/account/membership")).rejects.toThrow(
      RedirectSignal,
    );

    expect(redirect).toHaveBeenCalledWith(
      "/api/auth/refresh?next=%2Faccount%2Fmembership",
    );
  });

  it("redirects straight to /sign-in when there's no session and no refresh token at all", async () => {
    await expect(requireSession("/account")).rejects.toThrow(RedirectSignal);

    expect(redirect).toHaveBeenCalledWith("/sign-in?next=%2Faccount");
  });

  it("guards against an off-site next path, falling back to /account", async () => {
    await expect(requireSession("https://evil.example/phish")).rejects.toThrow(
      RedirectSignal,
    );

    expect(redirect).toHaveBeenCalledWith("/sign-in?next=%2Faccount");
  });
});
