"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { backendLogin } from "@/lib/voices/membership/auth-client";
import { claimArtistInvitation } from "@/lib/voices/membership/artist-invitations-client";
import {
  getAccessToken,
  getSession,
  setAccessTokenCookie,
  setSessionCookies,
} from "@/lib/voices/membership/session";

const schema = z.object({
  token: z.string().min(1),
  invitationEmail: z.string().email(),
  mode: z.enum(["session", "existing", "create"]),
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  artistName: z.string().optional(),
  newsletters: z.string().optional(),
});

export type ClaimArtistInvitationState =
  | { status: "error"; mode: "existing" | "create"; message: string }
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

export async function claimArtistInvitationAction(
  _prevState: ClaimArtistInvitationState,
  formData: FormData,
): Promise<ClaimArtistInvitationState> {
  const parsed = schema.safeParse({
    token: text(formData.get("token")),
    invitationEmail: text(formData.get("invitationEmail")),
    mode: text(formData.get("mode")),
    password: text(formData.get("password")) || undefined,
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
      };
    }

    body = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      password,
      ...(parsed.data.artistName ? { artistName: parsed.data.artistName } : {}),
      newsletters: parsed.data.newsletters === "on",
    };
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
    if (result.status === 409) {
      return { status: "already_claimed", message: result.message };
    }

    return {
      status: "error",
      mode: mode === "create" ? "create" : "existing",
      message: result.message,
    };
  }

  await establishClaimSession(invitationEmail, password ?? "", result.data.token);
  redirect("/account/artist");
}
