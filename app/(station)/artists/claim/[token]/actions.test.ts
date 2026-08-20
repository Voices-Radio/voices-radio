import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new RedirectSignal(url);
  }),
}));

vi.mock("@/lib/voices/membership/artist-invitations-client", () => ({
  claimArtistInvitation: vi.fn(),
}));

vi.mock("@/lib/voices/membership/auth-client", () => ({
  backendLogin: vi.fn(),
}));

vi.mock("@/lib/voices/membership/session", () => ({
  getAccessToken: vi.fn(),
  getSession: vi.fn(),
  setAccessTokenCookie: vi.fn(),
  setSessionCookies: vi.fn(),
}));

const { redirect } = await import("next/navigation");
const { claimArtistInvitation } = await import(
  "@/lib/voices/membership/artist-invitations-client"
);
const { backendLogin } = await import("@/lib/voices/membership/auth-client");
const {
  getAccessToken,
  getSession,
  setAccessTokenCookie,
  setSessionCookies,
} = await import("@/lib/voices/membership/session");
const { claimArtistInvitationAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

const SUCCESS = {
  message: "Artist profile claimed successfully",
  user: { _id: "u1", email: "dj@example.com" },
  artist: { id: "artist-1", name: "DJ Test" },
  token: "claim-access",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSession).mockResolvedValue(null);
  vi.mocked(getAccessToken).mockResolvedValue(undefined);
  vi.mocked(claimArtistInvitation).mockResolvedValue({ ok: true, data: SUCCESS });
  vi.mocked(backendLogin).mockResolvedValue({
    ok: false,
    status: 401,
    payload: null,
  });
});

describe("claimArtistInvitationAction", () => {
  it("uses the signed-in matching account bearer token without asking for a password", async () => {
    vi.mocked(getSession).mockResolvedValue({
      _id: "u1",
      email: "dj@example.com",
    });
    vi.mocked(getAccessToken).mockResolvedValue("existing-access");

    await expect(
      claimArtistInvitationAction(
        undefined,
        formData({
          token: "invite-token",
          invitationEmail: "dj@example.com",
          mode: "session",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(claimArtistInvitation).toHaveBeenCalledWith(
      "invite-token",
      {},
      "existing-access",
    );
    expect(setAccessTokenCookie).toHaveBeenCalledWith({ token: "claim-access" });
    expect(redirect).toHaveBeenCalledWith("/account/artist");
  });

  it("requires a password for the existing-account branch when there is no matching session", async () => {
    const result = await claimArtistInvitationAction(
      undefined,
      formData({
        token: "invite-token",
        invitationEmail: "dj@example.com",
        mode: "existing",
      }),
    );

    expect(result).toEqual({
      status: "error",
      mode: "existing",
      message:
        "Enter the password for the existing Voices account to claim this artist profile.",
    });
    expect(claimArtistInvitation).not.toHaveBeenCalled();
  });

  it("submits the existing-account password and establishes a full session when login succeeds", async () => {
    vi.mocked(backendLogin).mockResolvedValue({
      ok: true,
      status: 200,
      payload: {
        token: "login-access",
        refreshToken: "login-refresh",
        user: { _id: "u1" },
      },
    });

    await expect(
      claimArtistInvitationAction(
        undefined,
        formData({
          token: "invite-token",
          invitationEmail: "dj@example.com",
          mode: "existing",
          password: "correct-password",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(claimArtistInvitation).toHaveBeenCalledWith(
      "invite-token",
      { password: "correct-password" },
      undefined,
    );
    expect(setSessionCookies).toHaveBeenCalledWith({
      token: "login-access",
      refreshToken: "login-refresh",
    });
  });

  it("submits create-account fields including artistName for create_new invitations", async () => {
    await expect(
      claimArtistInvitationAction(
        undefined,
        formData({
          token: "invite-token",
          invitationEmail: "new@example.com",
          mode: "create",
          firstName: "Ada",
          lastName: "Lovelace",
          password: "new-password",
          artistName: "Ada FM",
          newsletters: "on",
        }),
      ),
    ).rejects.toThrow(RedirectSignal);

    expect(claimArtistInvitation).toHaveBeenCalledWith(
      "invite-token",
      {
        firstName: "Ada",
        lastName: "Lovelace",
        password: "new-password",
        artistName: "Ada FM",
        newsletters: true,
      },
      undefined,
    );
  });

  it("keeps already-claimed invitations distinct from generic errors", async () => {
    vi.mocked(claimArtistInvitation).mockResolvedValue({
      ok: false,
      status: 409,
      code: "ALREADY_CLAIMED",
      message: "Invitation already claimed.",
    });

    const result = await claimArtistInvitationAction(
      undefined,
      formData({
        token: "invite-token",
        invitationEmail: "dj@example.com",
        mode: "existing",
        password: "correct-password",
      }),
    );

    expect(result).toEqual({
      status: "already_claimed",
      message: "Invitation already claimed.",
    });
  });
});
