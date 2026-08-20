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
    expect(accountLinksForCapabilities(["member"]).map((link) => link.label)).toEqual([
      "Dashboard",
      "Membership",
      "Benefits",
      "Redemptions",
      "Profile",
    ]);
  });

  it("shows only the artist link for artist-only accounts", () => {
    expect(accountLinksForCapabilities(["artist"])).toEqual([
      { href: "/account/artist", label: "Artist" },
    ]);
  });

  it("shows both identities for dual-capability accounts", () => {
    expect(accountLinksForCapabilities(["artist", "member"]).map((link) => link.label)).toEqual([
      "Dashboard",
      "Artist",
      "Membership",
      "Benefits",
      "Redemptions",
      "Profile",
    ]);
  });

  it("shows a single account overview link for neither-capability accounts", () => {
    expect(accountLinksForCapabilities([])).toEqual([
      { href: "/account", label: "Account" },
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
    expect(accountHomeDecision(capabilities(["artist", "member"]), "artist")).toEqual({
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

describe("resolvePostLoginPath", () => {
  it("keeps wrong-door sign-in on a reachable capability page", () => {
    expect(
      resolvePostLoginPath({
        intent: "member",
        capabilities: capabilities(["artist"]),
      }),
    ).toBe("/account/artist?missing=member");
  });
});
