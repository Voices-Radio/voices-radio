import { describe, expect, it } from "vitest";
import { getClientIp } from "./rate-limit";

function requestWith(headers: Record<string, string>) {
  return new Request("https://voicesradio.co.uk/api/auth/login", { headers });
}

describe("getClientIp", () => {
  /**
   * The bypass this ordering exists to prevent. `x-forwarded-for` is a
   * pass-through header: a caller can send their own value and the platform
   * appends the real IP rather than replacing the header. Trusting the
   * left-most entry therefore let an attacker choose their own rate-limit
   * bucket and rotate it per request, neutralising the login/register limits.
   *
   * `x-real-ip` is set by the edge from the actual connection, so it wins.
   */
  it("prefers x-real-ip over a spoofed x-forwarded-for", () => {
    expect(
      getClientIp(
        requestWith({
          "x-forwarded-for": "1.2.3.4",
          "x-real-ip": "203.0.113.9",
        }),
      ),
    ).toBe("203.0.113.9");
  });

  it("ignores an attacker-chosen prefix even when the real IP is appended", () => {
    expect(
      getClientIp(
        requestWith({
          "x-forwarded-for": "1.2.3.4, 203.0.113.9",
          "x-real-ip": "203.0.113.9",
        }),
      ),
    ).toBe("203.0.113.9");
  });

  it("falls back to the left-most x-forwarded-for when x-real-ip is absent", () => {
    expect(
      getClientIp(requestWith({ "x-forwarded-for": "198.51.100.7, 10.0.0.1" })),
    ).toBe("198.51.100.7");
  });

  it("falls back to a shared bucket rather than skipping the limit", () => {
    expect(getClientIp(requestWith({}))).toBe("unknown");
  });

  it("ignores a blank x-real-ip", () => {
    expect(
      getClientIp(
        requestWith({ "x-real-ip": "   ", "x-forwarded-for": "198.51.100.7" }),
      ),
    ).toBe("198.51.100.7");
  });
});
