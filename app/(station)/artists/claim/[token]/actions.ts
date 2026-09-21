"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { backendLogin } from "@/lib/voices/membership/auth-client";
import {
  claimArtistInvitation,
  renewArtistInvitation,
} from "@/lib/voices/membership/artist-invitations-client";
import type { ClaimMode } from "@/lib/voices/membership/claim-mode";
import {
  getAccessToken,
  getSession,
  setAccessTokenCookie,
  setSessionCookies,
} from "@/lib/voices/membership/session";

// The backend's floor (routes/artistInvitations.js MIN_PASSWORD_LENGTH).
// Checked here too so a short password is refused before a round trip.
const MIN_PASSWORD_LENGTH = 8;

const schema = z.object({
  token: z.string().min(1),
  invitationEmail: z.string().email(),
  mode: z.enum(["session", "existing", "set_password", "create"]),
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  artistName: z.string().optional(),
  newsletters: z.string().optional(),
});

/** What the form gets back so a failed submit never empties it. */
export type ClaimFormValues = {
  firstName?: string;
  lastName?: string;
  artistName?: string;
  newsletters?: boolean;
};

export type ClaimArtistInvitationState =
  | {
      status: "error";
      mode: Exclude<ClaimMode, "session">;
      message: string;
      field?: "artistName" | "password";
      values?: ClaimFormValues;
    }
  | { status: "already_claimed"; message: string }
  | undefined;

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function establishClaimSession(email: string, password: string, token: string) {
  if (password) {
    const loginResult = await backendLogin({ email, password });
    if (
      loginResult.ok &&
      loginResult.payload?.token &&
      loginResult.payload?.refreshToken
    ) {
      await setSessionCookies({
        token: loginResult.payload.token,
        refreshToken: loginResult.payload.refreshToken,
      });
      return;
    }
  }

  await setAccessTokenCookie({ token });
}

const SHORT_PASSWORD_MESSAGE = `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`;

export async function claimArtistInvitationAction(
  _prevState: ClaimArtistInvitationState,
  formData: FormData,
): Promise<ClaimArtistInvitationState> {
  const parsed = schema.safeParse({
    token: text(formData.get("token")),
    invitationEmail: text(formData.get("invitationEmail")),
    mode: text(formData.get("mode")),
    // Not trimmed: a password's spaces are part of it.
    password:
      typeof formData.get("password") === "string" && formData.get("password")
        ? (formData.get("password") as string)
        : undefined,
    firstName: text(formData.get("firstName")) || undefined,
    lastName: text(formData.get("lastName")) || undefined,
    artistName: text(formData.get("artistName")) || undefined,
    newsletters: formData.get("newsletters") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      mode: "existing",
      message: "Please check the claim form and try again.",
    };
  }

  const { token, invitationEmail, mode, password } = parsed.data;
  const values: ClaimFormValues = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    artistName: parsed.data.artistName,
    newsletters: parsed.data.newsletters === "on",
  };
  const session = await getSession();
  const accessToken = await getAccessToken();
  const sessionMatchesInvitation =
    Boolean(accessToken) &&
    session?.email?.toLowerCase() === invitationEmail.toLowerCase();

  let body: Record<string, unknown> = {};
  let bearerToken: string | undefined;

  if (mode === "session" && sessionMatchesInvitation) {
    bearerToken = accessToken;
  } else if (mode === "create") {
    if (!parsed.data.firstName || !parsed.data.lastName || !password) {
      return {
        status: "error",
        mode: "create",
        message: "Enter your name and choose a password to claim this profile.",
        values,
      };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        status: "error",
        mode: "create",
        field: "password",
        message: SHORT_PASSWORD_MESSAGE,
        values,
      };
    }

    body = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      password,
      ...(parsed.data.artistName ? { artistName: parsed.data.artistName } : {}),
      newsletters: parsed.data.newsletters === "on",
    };
  } else if (mode === "set_password") {
    // An account that signs in with Apple and has no password yet: the claim
    // sets one (see routes/artistInvitations.js, D2).
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return {
        status: "error",
        mode: "set_password",
        field: "password",
        message: SHORT_PASSWORD_MESSAGE,
      };
    }
    body = { password };
  } else {
    if (!password) {
      return {
        status: "error",
        mode: "existing",
        message:
          "Enter the password for the existing Voices account to claim this artist profile.",
      };
    }

    body = { password };
  }

  const result = await claimArtistInvitation(token, body, bearerToken);

  if (!result.ok) {
    if (result.code === "ALREADY_CLAIMED") {
      return { status: "already_claimed", message: result.message };
    }

    // Fixable on the same form: the invitation is still pending, so the DJ
    // picks a variant and resubmits with everything else still filled in.
    if (result.code === "NAME_TAKEN") {
      return {
        status: "error",
        mode: "create",
        field: "artistName",
        message: result.message,
        values,
      };
    }

    return {
      status: "error",
      mode: mode === "session" ? "existing" : mode,
      message: result.message,
      values,
    };
  }

  await establishClaimSession(invitationEmail, password ?? "", result.data.token);
  redirect("/account/artist");
}

export type RenewInvitationState =
  | { status: "sent"; message: string }
  | { status: "error"; message: string }
  | undefined;

export async function renewInvitationAction(
  _prevState: RenewInvitationState,
  formData: FormData,
): Promise<RenewInvitationState> {
  const token = text(formData.get("token"));
  if (!token) {
    return {
      status: "error",
      message: "This link is missing its invitation. Open it from your email again.",
    };
  }

  const result = await renewArtistInvitation(token);
  return result.ok
    ? { status: "sent", message: result.data.message }
    : { status: "error", message: result.message };
}
