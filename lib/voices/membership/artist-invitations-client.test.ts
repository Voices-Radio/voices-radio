import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimArtistInvitation,
  validateArtistInvitation,
} from "./artist-invitations-client";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("validateArtistInvitation", () => {
  it("returns the invitation payload when the token is valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          invitation: {
            id: "invite-1",
            email: "dj@example.com",
            expiresAt: "2027-01-01T00:00:00Z",
            kind: "claim_existing",
            artist: {
              id: "artist-1",
              name: "DJ Test",
              imageUrl: null,
              bio: "Bio",
            },
          },
        }),
      ),
    );

    await expect(validateArtistInvitation("token")).resolves.toMatchObject({
      ok: true,
      data: { invitation: { kind: "claim_existing" } },
    });
  });

  it("maps a 404 to an invalid invitation state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, 404)));

    await expect(validateArtistInvitation("dead")).resolves.toEqual({
      ok: false,
      status: 404,
      code: "INVALID_INVITATION",
      message: "This invitation is no longer valid.",
    });
  });
});

describe("claimArtistInvitation", () => {
  it("passes through bearer auth when a matching signed-in session is used", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ token: "at" }));
    vi.stubGlobal("fetch", fetchMock);

    await claimArtistInvitation("token", {}, "access-token");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/artist-invitations/claim/token"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  it("maps 401 separately from 409 already claimed", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response({ message: "Sign in or provide password." }, 401))
        .mockResolvedValueOnce(response({ message: "Already claimed." }, 409)),
    );

    await expect(claimArtistInvitation("token", {})).resolves.toMatchObject({
      ok: false,
      status: 401,
      code: "AUTH_REQUIRED",
    });
    await expect(claimArtistInvitation("token", {})).resolves.toMatchObject({
      ok: false,
      status: 409,
      code: "ALREADY_CLAIMED",
    });
  });
});
