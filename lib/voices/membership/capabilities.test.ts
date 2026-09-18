import { describe, expect, it } from "vitest";
import {
  accountHomeDecision,
  accountLinksForCapabilities,
  resolvePostLoginPath,
  type AccountCapabilities,
} from "./capabilities";

function capabilities(values: AccountCapabilities["capabilities"]) {
  return {
    user: { _id: "u1", email: "test@example.com" },
    capabilities: values,
    artist: values.includes("artist")
      ? {
          id: "artist-1",
          name: "DJ Test",
          imageUrl: null,
          programmingEmail: "dj@example.com",
          radioCultArtistId: "rc-1",
          radioCultSyncState: "linked",
          canManageProfile: true,
        }
      : null,
    member: values.includes("member")
      ? { status: "active", tierId: "insider", cadence: "monthly" }
      : null,
  } satisfies AccountCapabilities;
}

describe("accountLinksForCapabilities", () => {
  it("shows member links for member-only accounts", () => {
    expect(
      accountLinksForCapabilities(["member"]).map((link) => link.label),
    ).toEqual([
      "Dashboard",
      "Favourites",
      "Membership",
      "Benefits",
      "Redemptions",
      "Profile",
    ]);
  });

  it("shows only the artist link, plus Favourites, for artist-only accounts", () => {
    expect(accountLinksForCapabilities(["artist"])).toEqual([
      { href: "/account/artist", label: "Artist" },
      { href: "/account/favourites", label: "Favourites" },
    ]);
  });

  it("shows both identities for dual-capability accounts", () => {
    expect(
      accountLinksForCapabilities(["artist", "member"]).map(
        (link) => link.label,
      ),
    ).toEqual([
      "Dashboard",
      "Artist",
      "Favourites",
      "Membership",
      "Benefits",
      "Redemptions",
      "Profile",
    ]);
  });

  it("shows Favourites alongside the account overview link for neither-capability accounts", () => {
    // Favourites is a plain-account feature — it isn't gated on member or
    // artist capability, only on requireSession() at the layout level.
    expect(accountLinksForCapabilities([])).toEqual([
      { href: "/account", label: "Account" },
      { href: "/account/favourites", label: "Favourites" },
    ]);
  });
});

describe("accountHomeDecision", () => {
  it("renders the member dashboard for member-only accounts", () => {
    expect(accountHomeDecision(capabilities(["member"]), undefined)).toEqual({
      kind: "member",
    });
  });

  it("redirects artist-only accounts to the artist profile URL", () => {
    expect(accountHomeDecision(capabilities(["artist"]), undefined)).toEqual({
      kind: "redirect",
      href: "/account/artist",
    });
  });

  it("honours the persisted artist mode for dual-capability accounts", () => {
    expect(
      accountHomeDecision(capabilities(["artist", "member"]), "artist"),
    ).toEqual({
      kind: "redirect",
      href: "/account/artist",
    });
  });

  it("renders a coherent empty state when the account has neither capability", () => {
    expect(accountHomeDecision(capabilities([]), undefined)).toEqual({
      kind: "empty",
    });
  });
});

describe("resolvePostLoginPath — the sign-in matrix (plan §4a)", () => {
  // One sign-in door, so the only inputs are what the account holds and an
  // optional deep link. Every combination is enumerated rather than sampled:
  // the "not linked to an artist profile" notice came from a combination
  // nobody had written down.
  const HOLDINGS: Array<[string, AccountCapabilities | null, string]> = [
    ["neither", capabilities([]), "/account"],
    ["member-only", capabilities(["member"]), "/account/profile"],
    ["artist-only", capabilities(["artist"]), "/account/artist"],
    [
      "artist and member",
      capabilities(["artist", "member"]),
      "/account/profile",
    ],
    ["unknown (lookup failed)", null, "/account"],
  ];

  const NEXTS: Array<[string, string | undefined, "honoured" | "ignored"]> = [
    ["no next", undefined, "ignored"],
    ["a member page", "/account/membership", "honoured"],
    ["the artist area", "/account/artist", "honoured"],
    ["an off-site URL", "https://evil.example.com/phish", "ignored"],
    ["a protocol-relative URL", "//evil.example.com/phish", "ignored"],
  ];

  const matrix = HOLDINGS.flatMap(([holding, caps, landing]) =>
    NEXTS.map(([nextLabel, next, rule]) => ({
      holding,
      nextLabel,
      caps,
      next,
      expected: rule === "honoured" ? (next as string) : landing,
    })),
  );

  it.each(matrix)(
    "$holding account, $nextLabel → $expected",
    ({ caps, next, expected }) => {
      expect(resolvePostLoginPath({ next, capabilities: caps })).toBe(expected);
    },
  );

  it("never produces a notice marker for any combination", () => {
    for (const { caps, next } of matrix) {
      expect(resolvePostLoginPath({ next, capabilities: caps })).not.toMatch(
        /[?&](missing|artist)=/,
      );
    }
  });

  it("lands a plain member sign-in on the profile page", () => {
    expect(
      resolvePostLoginPath({ capabilities: capabilities(["member"]) }),
    ).toBe("/account/profile");
  });

  it("still lands artist-only accounts on the artist profile", () => {
    expect(
      resolvePostLoginPath({ capabilities: capabilities(["artist"]) }),
    ).toBe("/account/artist");
  });

  it("lets an explicit safe next path win over the profile default", () => {
    expect(
      resolvePostLoginPath({
        next: "/account/membership",
        capabilities: capabilities(["member"]),
      }),
    ).toBe("/account/membership");
  });
});
