import { beforeEach, describe, expect, it, vi } from "vitest";

const limitMock = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {}
  },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow = vi.fn(() => "sliding");
    limit = limitMock;
  }
  return { Ratelimit };
});

async function loadModule(withRedis: boolean) {
  vi.resetModules();
  if (withRedis) {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
  } else {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
  }
  return import("./rate-limit");
}

function request(ip?: string) {
  return new Request("https://example.test/api/auth/login", {
    method: "POST",
    headers: ip ? { "x-forwarded-for": ip } : {},
  });
}

beforeEach(() => {
  limitMock.mockReset();
});

describe("enforceRateLimit", () => {
  it("allows the request when Redis is not configured", async () => {
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(false);
    const result = await enforceRateLimit(request("1.2.3.4"), AUTH_RATE_LIMITS.login);

    // Fail open: an unconfigured limiter must never block sign-in.
    expect(result).toBeNull();
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("also accepts Vercel's KV_REST_API_* variable names", async () => {
    limitMock.mockResolvedValue({ success: false, reset: Date.now() + 5_000 });
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "https://kv.test");
    vi.stubEnv("KV_REST_API_TOKEN", "kv-token");
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await import("./rate-limit");

    const result = await enforceRateLimit(
      request("1.2.3.4"),
      AUTH_RATE_LIMITS.login,
    );
    expect(result?.status).toBe(429);
  });

  it("allows the request when under the limit", async () => {
    limitMock.mockResolvedValue({ success: true, reset: Date.now() + 1000 });
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(true);

    expect(
      await enforceRateLimit(request("1.2.3.4"), AUTH_RATE_LIMITS.login),
    ).toBeNull();
  });

  it("returns 429 with Retry-After once the limit is exceeded", async () => {
    limitMock.mockResolvedValue({ success: false, reset: Date.now() + 30_000 });
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(true);

    const result = await enforceRateLimit(
      request("1.2.3.4"),
      AUTH_RATE_LIMITS.login,
    );

    expect(result?.status).toBe(429);
    expect(Number(result?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("fails open when the Redis call throws", async () => {
    limitMock.mockRejectedValue(new Error("redis down"));
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(true);

    // A Redis blip must not become a total sign-in outage.
    expect(
      await enforceRateLimit(request("1.2.3.4"), AUTH_RATE_LIMITS.login),
    ).toBeNull();
  });

  it("keys on the left-most x-forwarded-for entry", async () => {
    limitMock.mockResolvedValue({ success: true, reset: Date.now() + 1000 });
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(true);

    await enforceRateLimit(request("9.9.9.9, 10.0.0.1"), AUTH_RATE_LIMITS.login);
    expect(limitMock).toHaveBeenCalledWith("9.9.9.9");
  });

  it("falls back to a shared bucket when no IP header is present", async () => {
    limitMock.mockResolvedValue({ success: true, reset: Date.now() + 1000 });
    const { enforceRateLimit, AUTH_RATE_LIMITS } = await loadModule(true);

    // Must not skip the limit entirely — a missing header can't be an opt-out.
    await enforceRateLimit(request(), AUTH_RATE_LIMITS.login);
    expect(limitMock).toHaveBeenCalledWith("unknown");
  });

  it("defines distinct buckets per endpoint", async () => {
    const { AUTH_RATE_LIMITS } = await loadModule(true);
    const names = Object.values(AUTH_RATE_LIMITS).map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
