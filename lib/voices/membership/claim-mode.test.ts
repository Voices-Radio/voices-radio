import { describe, expect, it } from "vitest";
import { canChooseClaimMode, claimModeFor } from "./claim-mode";

type Account = { exists: boolean; passwordSet: boolean } | null;

const NO_ACCOUNT: Account = { exists: false, passwordSet: false };
const WITH_PASSWORD: Account = { exists: true, passwordSet: true };
const APPLE_ONLY: Account = { exists: true, passwordSet: false };

describe("claimModeFor — the claim matrix (plan §4b C1–C7)", () => {
  it.each([
    // [label, session matches, kind, account, expected]
    ["C1 existing artist, no account", false, "claim_existing", NO_ACCOUNT, "create"],
    ["C2 net-new artist, no account", false, "create_new", NO_ACCOUNT, "create"],
    ["C3 existing artist, account with password", false, "claim_existing", WITH_PASSWORD, "existing"],
    ["C3 net-new artist, account with password", false, "create_new", WITH_PASSWORD, "existing"],
    ["C4 signed in as the invited address", true, "claim_existing", WITH_PASSWORD, "session"],
    ["C4 signed in, Apple-only account", true, "claim_existing", APPLE_ONLY, "session"],
    ["C7 Apple-only account", false, "claim_existing", APPLE_ONLY, "set_password"],
    ["C7 Apple-only account, net-new artist", false, "create_new", APPLE_ONLY, "set_password"],
  ] as const)("%s → %s", (_label, sessionMatchesInvitation, kind, account, expected) => {
    expect(
      claimModeFor({ sessionMatchesInvitation, invitation: { kind, account } }),
    ).toBe(expected);
  });

  it("never asks for an existing password when the address has no account — the F3 regression", () => {
    expect(
      claimModeFor({
        sessionMatchesInvitation: false,
        invitation: { kind: "claim_existing", account: NO_ACCOUNT },
      }),
    ).not.toBe("existing");
  });

  it("falls back to the kind-based guess only when the backend did not report the account", () => {
    expect(
      claimModeFor({
        sessionMatchesInvitation: false,
        invitation: { kind: "claim_existing", account: null },
      }),
    ).toBe("existing");
    expect(
      claimModeFor({
        sessionMatchesInvitation: false,
        invitation: { kind: "create_new", account: null },
      }),
    ).toBe("create");
  });
});

describe("canChooseClaimMode", () => {
  it("offers no choice once the backend has said which path works", () => {
    for (const account of [NO_ACCOUNT, WITH_PASSWORD, APPLE_ONLY]) {
      expect(
        canChooseClaimMode({
          sessionMatchesInvitation: false,
          invitation: { kind: "claim_existing", account },
        }),
      ).toBe(false);
    }
  });

  it("offers the choice only when the account state is unknown", () => {
    expect(
      canChooseClaimMode({
        sessionMatchesInvitation: false,
        invitation: { kind: "claim_existing", account: null },
      }),
    ).toBe(true);
  });

  it("never when already signed in as the invited address", () => {
    expect(
      canChooseClaimMode({
        sessionMatchesInvitation: true,
        invitation: { kind: "claim_existing", account: null },
      }),
    ).toBe(false);
  });
});
