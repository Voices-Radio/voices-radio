export type AccountCapability = "artist" | "member";

export interface AccountCapabilitiesUser {
  _id?: string;
  id?: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface ArtistCapabilityProfile {
  id: string;
  name: string;
  imageUrl: string | null;
  programmingEmail: string | null;
  radioCultArtistId: string | null;
  radioCultSyncState: string | null;
  canManageProfile: boolean;
}

export interface MemberCapabilityProfile {
  status: string | null;
  tierId: string | null;
  cadence: "monthly" | "annual" | string | null;
}

export interface AccountCapabilities {
  user: AccountCapabilitiesUser;
  capabilities: AccountCapability[];
  artist: ArtistCapabilityProfile | null;
  member: MemberCapabilityProfile | null;
}

export type AccountMode = "artist" | "member";
export type AccountHomeDecision =
  { kind: "member" } | { kind: "empty" } | { kind: "redirect"; href: string };

export function hasCapability(
  capabilities: AccountCapabilities | null | undefined,
  capability: AccountCapability,
) {
  return capabilities?.capabilities.includes(capability) ?? false;
}

export function safeAccountNextPath(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : undefined;
}

export function defaultAccountPathForCapabilities(
  capabilities: AccountCapabilities | null | undefined,
) {
  if (hasCapability(capabilities, "member")) return "/account";
  if (hasCapability(capabilities, "artist")) return "/account/artist";
  return "/account";
}

export function parseAccountMode(value: unknown): AccountMode | undefined {
  return value === "artist" || value === "member" ? value : undefined;
}

export function accountHomeDecision(
  capabilities: AccountCapabilities | null,
  persistedMode: AccountMode | undefined,
): AccountHomeDecision {
  const hasMember = hasCapability(capabilities, "member");
  const hasArtist = hasCapability(capabilities, "artist");

  if (hasMember && hasArtist && persistedMode === "artist") {
    return { kind: "redirect", href: "/account/artist" };
  }

  if (hasMember) return { kind: "member" };
  if (hasArtist) return { kind: "redirect", href: "/account/artist" };

  return { kind: "empty" };
}

/**
 * Where a successful sign-in lands: a safe deep link if there is one,
 * otherwise wherever this account's own capabilities point.
 *
 * Deliberately takes nothing about *how* the person signed in. The old
 * artist/member "doors" fed an intent in here, and an intent the account could
 * not satisfy became a `?missing=` notice — telling someone whose sign-in had
 * worked that their account was "not linked to an artist profile". There is
 * no sign-in outcome that should produce a notice, so there is no marker.
 */
export function resolvePostLoginPath({
  next,
  capabilities,
}: {
  next?: string;
  capabilities: AccountCapabilities | null;
}) {
  const safeNext = safeAccountNextPath(next);
  if (safeNext) return safeNext;

  // A plain sign-in (no deep-link `next`) lands the member on their profile
  // rather than the account overview or wherever they happened to be when
  // they clicked "Sign in".
  if (hasCapability(capabilities, "member")) return "/account/profile";

  return defaultAccountPathForCapabilities(capabilities);
}

export function accountLinksForCapabilities(
  capabilities: AccountCapability[] | null | undefined,
) {
  const values = capabilities ?? [];
  const hasMember = values.includes("member");
  const hasArtist = values.includes("artist");

  // Favourites is a plain-account feature, not gated on member or artist
  // capability — anyone who cleared requireSession() in
  // app/(station)/account/layout.tsx can save shows, so the link always
  // appears rather than being folded into either capability-specific block.
  if (!hasMember && !hasArtist) {
    return [
      { href: "/account", label: "Account" },
      { href: "/account/favourites", label: "Favourites" },
    ];
  }

  return [
    ...(hasMember ? [{ href: "/account", label: "Dashboard" }] : []),
    ...(hasArtist ? [{ href: "/account/artist", label: "Artist" }] : []),
    { href: "/account/favourites", label: "Favourites" },
    ...(hasMember
      ? [
          { href: "/account/membership", label: "Membership" },
          { href: "/account/benefits", label: "Benefits" },
          { href: "/account/redemptions", label: "Redemptions" },
          { href: "/account/profile", label: "Profile" },
        ]
      : []),
  ];
}
