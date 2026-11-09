import type { ArtistInvitation } from "./artist-invitations-client";

/**
 * The four ways a claim can go through:
 *
 *   session       already signed in as the invited address — one click
 *   existing      the address has an account with a password — enter it
 *   set_password  the address has an account with no password (Sign in with
 *                 Apple) — choose one; the invitation is the proof
 *   create        no account yet — make one
 */
export type ClaimMode = "session" | "existing" | "set_password" | "create";

type ClaimModeInput = {
  sessionMatchesInvitation: boolean;
  invitation: Pick<ArtistInvitation, "kind" | "account">;
};

/**
 * The one claim path that can succeed for this address.
 *
 * This used to be chosen from `kind` — whether *the artist* already existed —
 * which says nothing about whether *the DJ* has an account. With 136 of 139
 * artists unlinked, most DJs were asked for the password of an account they
 * had never made. The backend now reports the account, so the page asks for
 * the right thing first time.
 */
export function claimModeFor({
  sessionMatchesInvitation,
  invitation,
}: ClaimModeInput): ClaimMode {
  if (sessionMatchesInvitation) return "session";

  const { account } = invitation;
  // Only when the backend could not say (see artist-invitations-client.ts):
  // the old kind-based guess, with the choice left open by canChooseClaimMode.
  if (!account) return invitation.kind === "create_new" ? "create" : "existing";

  if (!account.exists) return "create";
  return account.passwordSet ? "existing" : "set_password";
}

/**
 * Whether to offer a choice of path at all. When the backend has said which
 * one works, offering the others only offers ways to fail.
 */
export function canChooseClaimMode({
  sessionMatchesInvitation,
  invitation,
}: ClaimModeInput): boolean {
  return !sessionMatchesInvitation && invitation.account === null;
}
