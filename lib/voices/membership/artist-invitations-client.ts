import "server-only";
import { z } from "zod";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";

const invitationArtistSchema = z
  .object({
    // Nullable, not required: routes/artistInvitations.js sends `id: null`
    // for a create_new invitation (the artistName path, invited before any
    // Artist document exists) — that's most invitations, not an edge case.
    // Unused downstream (only .name/.bio are ever read, in
    // InvitationSummary), so relaxing this cost nothing but fixed a real
    // production failure: every create_new claim link failed schema
    // validation and rendered "could not be loaded" instead of the form.
    id: z.string().nullable(),
    name: z.string(),
    // .default(null) — an omitted key must be treated exactly like an explicit
    // null, the same rule schemas.ts applies for the same reason. The backend
    // builds this block by reading fields straight off the Artist document,
    // and JSON.stringify drops undefined keys entirely, so an artist with no
    // image sends no `imageUrl` at all. Requiring the key turns that into a
    // parse failure, which this page can only render as "invitation
    // unavailable" — stranding a DJ on a perfectly valid invitation with
    // nothing to diagnose. Verified against production: 1 of 137 artists is
    // already in exactly this state.
    imageUrl: z.string().nullable().default(null),
    bio: z.string().nullable().default(null),
  })
  .nullable();

const invitationSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  expiresAt: z.string(),
  kind: z.enum(["claim_existing", "create_new"]),
  artist: invitationArtistSchema,
});

const validateInvitationSchema = z.object({
  invitation: invitationSchema,
});

const claimSuccessSchema = z.object({
  message: z.string(),
  user: z.object({
    _id: z.string().optional(),
    id: z.string().optional(),
    email: z.string().email().nullable().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.string().optional(),
  }),
  artist: z.object({ id: z.string(), name: z.string() }),
  token: z.string(),
});

export type ArtistInvitation = z.infer<typeof invitationSchema>;
export type ArtistInvitationValidation = z.infer<
  typeof validateInvitationSchema
>;
export type ArtistInvitationClaimSuccess = z.infer<typeof claimSuccessSchema>;

export type ArtistInvitationResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string };

function errorResult(
  status: number,
  payload: unknown,
): ArtistInvitationResult<never> {
  const message =
    typeof payload === "object" &&
    payload &&
    "message" in payload &&
    typeof payload.message === "string"
      ? payload.message
      : undefined;

  if (status === 404) {
    return {
      ok: false,
      status,
      code: "INVALID_INVITATION",
      message: "This invitation is no longer valid.",
    };
  }

  if (status === 401) {
    return {
      ok: false,
      status,
      code: "AUTH_REQUIRED",
      message:
        message ??
        "An account already exists for this email. Sign in, or provide the account password, to link this artist profile.",
    };
  }

  if (status === 409) {
    return {
      ok: false,
      status,
      code: "ALREADY_CLAIMED",
      message: message ?? "This invitation has already been claimed.",
    };
  }

  return {
    ok: false,
    status,
    code: "INVITATION_ERROR",
    message:
      message ?? "We couldn't process this invitation. Please try again.",
  };
}

export async function validateArtistInvitation(
  token: string,
): Promise<ArtistInvitationResult<ArtistInvitationValidation>> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/artist-invitations/validate/${encodeURIComponent(
        token,
      )}`,
      { cache: "no-store" },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) return errorResult(response.status, payload);

    const parsed = validateInvitationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        ok: false,
        status: 502,
        code: "INVALID_RESPONSE",
        message: "This invitation could not be loaded. Please try again.",
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices artist invitation validation failed:", error);
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message: "This invitation could not be loaded. Please try again.",
    };
  }
}

export async function claimArtistInvitation(
  token: string,
  body: Record<string, unknown>,
  bearerToken?: string,
): Promise<ArtistInvitationResult<ArtistInvitationClaimSuccess>> {
  try {
    const response = await fetch(
      `${VOICES_MEMBERSHIP_API_BASE_URL}/api/artist-invitations/claim/${encodeURIComponent(
        token,
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) return errorResult(response.status, payload);

    const parsed = claimSuccessSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        ok: false,
        status: 502,
        code: "INVALID_RESPONSE",
        message: "The profile was claimed, but the response was incomplete.",
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices artist invitation claim failed:", error);
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message: "We couldn't claim this profile. Please try again.",
    };
  }
}
