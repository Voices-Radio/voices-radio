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

export type AccountIntent = AccountCapability;
export type AccountMode = "artist" | "member";
export type AccountHomeDecision =
  | { kind: "member" }
  | { kind: "empty" }
  | { kind: "redirect"; href: string };

export function hasCapability(
  capabilities: AccountCapabilities | null | undefined,
  capability: AccountCapability,
) {
  return capabilities?.capabilities.includes(capability) ?? false;
}

export function parseAccountIntent(value: unknown): AccountIntent | undefined {
  return value === "artist" || value === "member" ? value : undefined;
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

export function resolvePostLoginPath({
  next,
  intent,
  capabilities,
}: {
  next?: string;
  intent?: AccountIntent;
  capabilities: AccountCapabilities | null;
}) {
  const safeNext = safeAccountNextPath(next);
  if (safeNext) return safeNext;

  if (intent === "artist") {
    return hasCapability(capabilities, "artist")
      ? "/account/artist"
      : `${defaultAccountPathForCapabilities(capabilities)}?missing=artist`;
  }

  if (intent === "member") {
    return hasCapability(capabilities, "member")
      ? "/account"
      : `${defaultAccountPathForCapabilities(capabilities)}?missing=member`;
  }

  return defaultAccountPathForCapabilities(capabilities);
}

export function accountLinksForCapabilities(
  capabilities: AccountCapability[] | null | undefined,
) {
  const values = capabilities ?? [];
  const hasMember = values.includes("member");
  const hasArtist = values.includes("artist");

  if (!hasMember && !hasArtist) {
    return [{ href: "/account", label: "Account" }];
  }

  return [
    ...(hasMember ? [{ href: "/account", label: "Dashboard" }] : []),
    ...(hasArtist ? [{ href: "/account/artist", label: "Artist" }] : []),
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
