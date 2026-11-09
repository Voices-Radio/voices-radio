/**
 * Maps a backend error `code` (contract §0's `{ error: { code, message } }`
 * envelope) to member-facing copy. The backend's own `message` is always a
 * safe fallback (contract: "human string, safe to show as fallback"), so a
 * code we don't recognise yet still shows something reasonable rather than
 * a raw code string.
 */
const MEMBERSHIP_ERROR_COPY: Record<string, string> = {
  ALREADY_REDEEMED: "You've already redeemed this benefit.",
  CAPACITY_FULL: "This benefit has reached capacity.",
  EXPIRED: "This benefit has expired.",
  INELIGIBLE: "Your current tier isn't eligible for this benefit.",
  RACE_LOST: "So close — someone else just claimed the last spot. Try the next one.",
  NO_ACTIVE_MEMBERSHIP: "You don't have an active membership yet.",
  PRICE_UNAVAILABLE: "Pricing is temporarily unavailable. Please try again shortly.",
  ALREADY_ON_TIER: "You're already on this tier.",
  MEMBERSHIP_LAPSED: "Your membership has already ended, so it can't be resumed.",
  INVALID_REDIRECT_URL: "Something went wrong starting checkout. Please try again.",
  INVALID_INPUT: "Please check your details and try again.",
  NO_SESSION: "Please sign in again.",
  NETWORK_ERROR: "We couldn't reach Voices. Please try again shortly.",
  INVALID_RESPONSE: "Something went wrong. Please try again.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export function describeMembershipError(
  code: string | undefined,
  backendMessage?: string | null,
): string {
  if (code && MEMBERSHIP_ERROR_COPY[code]) {
    return MEMBERSHIP_ERROR_COPY[code];
  }
  return backendMessage || DEFAULT_MESSAGE;
}
