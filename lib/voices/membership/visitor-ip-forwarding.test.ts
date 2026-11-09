import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Every per-visitor call to the backend must carry backendClientHeaders().
 * Without them the backend keys its rate limits on the Vercel egress IP, so
 * ALL visitors share one bucket: guest checkout allowed 8 per 15 minutes for
 * the whole site, DJ invitation claims 10, membership changes 20.
 */

const MARKER = { "X-Voices-Client-IP": "203.0.113.9", "X-Voices-Proxy-Secret": "s" };

vi.mock("@/lib/voices/membership/backend-headers", () => ({
  backendClientHeaders: vi.fn(async () => MARKER),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "access-token" }), set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers(),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const { authedFetch } = await import("./session");
const { guestCheckout, getGuestCheckoutStatus } = await import("./guest-checkout");
const { getPlans, getMembership } = await import("./membership-client");
const { validateArtistInvitation, claimArtistInvitation, renewArtistInvitation } = await import(
  "./artist-invitations-client"
);
const { getFavouriteLists } = await import("@/lib/voices/favourites/client");

const guest = {
  firstName: "A",
  lastName: "B",
  email: "a@example.com",
  newsletters: false,
  memberUpdates: false,
  amountMinor: 500,
  cadence: "monthly" as const,
  successUrl: "https://x/s",
  cancelUrl: "https://x/c",
};

const calls: Array<[string, () => Promise<unknown>]> = [
  ["authedFetch", () => authedFetch("/api/anything")],
  ["guestCheckout", () => guestCheckout(guest)],
  ["getGuestCheckoutStatus", () => getGuestCheckoutStatus("cs_test")],
  ["getPlans", () => getPlans()],
  ["getMembership", () => getMembership()],
  ["validateArtistInvitation", () => validateArtistInvitation("tok")],
  ["claimArtistInvitation", () => claimArtistInvitation("tok", {})],
  ["renewArtistInvitation", () => renewArtistInvitation("tok")],
  ["getFavouriteLists", () => getFavouriteLists()],
];

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => new Response("{}", { status: 200, headers: { "content-type": "application/json" } }));
});

describe("per-visitor backend calls forward the visitor IP", () => {
  it.each(calls)("%s sends backendClientHeaders()", async (_name, call) => {
    await call().catch(() => undefined);

    expect(fetchMock).toHaveBeenCalled();
    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers((init as RequestInit | undefined)?.headers).get("X-Voices-Client-IP")).toBe("203.0.113.9");
    }
  });
});
