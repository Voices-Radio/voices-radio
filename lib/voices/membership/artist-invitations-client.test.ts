import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimArtistInvitation,
  renewArtistInvitation,
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

  it("accepts a create_new invitation, whose artist has no id yet", async () => {
    // The invitation kind the artistName feature exists for: no Artist
    // document until the DJ actually claims, so the backend legitimately
    // sends artist.id: null (routes/artistInvitations.js GET
    // /validate/:token). This is the exact production shape that broke
    // every net-new invite's claim link — the schema required id: z.string()
    // and rejected the null, so the page showed "could not be loaded"
    // instead of the claim form.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          invitation: {
            id: "invite-2",
            email: "dj@example.com",
            expiresAt: "2027-01-01T00:00:00Z",
            kind: "create_new",
            artist: {
              id: null,
              name: "Faris Riaz",
              imageUrl: null,
              bio: null,
            },
          },
        }),
      ),
    );

    await expect(validateArtistInvitation("token")).resolves.toMatchObject({
      ok: true,
      data: { invitation: { kind: "create_new", artist: { id: null } } },
    });
  });

  it("maps a 404 to an invalid invitation state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, 404)));

    await expect(validateArtistInvitation("dead")).resolves.toEqual({
      ok: false,
      status: 404,
      code: "INVALID_INVITATION",
      reason: "invalid",
      message: "This invitation link isn't valid.",
    });
  });

  it("maps a 410 to an expired state, distinct from invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ reason: "expired" }, 410)),
    );

    await expect(validateArtistInvitation("old")).resolves.toMatchObject({
      ok: false,
      code: "EXPIRED_INVITATION",
      reason: "expired",
    });
  });

  it("maps a claimed 409 and carries whether the caller claimed it", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response({ reason: "claimed", claimedByYou: true }, 409),
        ),
    );

    await expect(validateArtistInvitation("used")).resolves.toMatchObject({
      ok: false,
      code: "ALREADY_CLAIMED",
      reason: "claimed",
      claimedByYou: true,
    });
  });

  it("sends the caller's session only when there is one", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({}, 404));
    vi.stubGlobal("fetch", fetchMock);

    await validateArtistInvitation("t1");
    await validateArtistInvitation("t2", "access-token");

    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("headers");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      headers: { Authorization: "Bearer access-token" },
    });
  });

  it("reads the account state and nameTaken", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          invitation: {
            id: "invite-3",
            email: "dj@example.com",
            expiresAt: "2027-01-01T00:00:00Z",
            kind: "create_new",
            artist: { id: null, name: "osBrain" },
            account: { exists: true, passwordSet: false },
            nameTaken: true,
          },
        }),
      ),
    );

    await expect(validateArtistInvitation("token")).resolves.toMatchObject({
      ok: true,
      data: {
        invitation: {
          account: { exists: true, passwordSet: false },
          nameTaken: true,
        },
      },
    });
  });

  it("treats a backend that does not report the account as unknown, not as an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          invitation: {
            id: "invite-4",
            email: "dj@example.com",
            expiresAt: "2027-01-01T00:00:00Z",
            kind: "claim_existing",
            artist: { id: "a1", name: "DJ Test" },
          },
        }),
      ),
    );

    await expect(validateArtistInvitation("token")).resolves.toMatchObject({
      ok: true,
      data: { invitation: { account: null, nameTaken: false } },
    });
  });
});

describe("renewArtistInvitation", () => {
  it("treats the backend's 202 as asked-for, carrying its wording", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response({ message: "On its way." }, 202));
    vi.stubGlobal("fetch", fetchMock);

    await expect(renewArtistInvitation("old")).resolves.toEqual({
      ok: true,
      data: { message: "On its way." },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/artist-invitations/renew/old"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports anything else as a failure to send", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, 500)));

    await expect(renewArtistInvitation("old")).resolves.toMatchObject({
      ok: false,
      code: "RENEW_FAILED",
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
        .mockResolvedValueOnce(
          response({ message: "Sign in or provide password." }, 401),
        )
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

  it("tells a taken artist name apart from an already-claimed invitation", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response(
            { reason: "name_taken", message: '"osBrain" is taken.' },
            409,
          ),
        ),
    );

    await expect(claimArtistInvitation("token", {})).resolves.toEqual({
      ok: false,
      status: 409,
      code: "NAME_TAKEN",
      reason: "name_taken",
      message: '"osBrain" is taken.',
    });
  });
});
