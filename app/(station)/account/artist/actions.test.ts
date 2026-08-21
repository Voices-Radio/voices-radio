import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/voices/membership/artist-profile-client", () => ({
  updateArtistProfile: vi.fn(),
  uploadArtistProfileImage: vi.fn(),
  lookupArtistUsername: vi.fn(),
}));

const { revalidatePath } = await import("next/cache");
const {
  updateArtistProfile,
  uploadArtistProfileImage,
  lookupArtistUsername,
} = await import("@/lib/voices/membership/artist-profile-client");
const {
  updateArtistProfileAction,
  uploadArtistImageAction,
  lookupUsernameAction,
} = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

const DEFAULT_PROFILE = {
  id: "artist-1",
  name: "DJ Test",
  bio: "Updated",
  imageUrl: null,
  bannerUrl: null,
  genres: ["house"],
  mixcloudUsername: "djtest",
  soundcloudUsername: null,
  programmingEmail: "dj@example.com",
  socialLinks: { instagram: "https://instagram.com/djtest" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateArtistProfile).mockResolvedValue({
    ok: true,
    data: DEFAULT_PROFILE,
  });
});

describe("updateArtistProfileAction", () => {
  it("sends only the backend's self-editable artist profile fields", async () => {
    const result = await updateArtistProfileAction(
      undefined,
      formData({
        name: "Malicious Rename",
        programmingEmail: "attacker@example.com",
        bio: "Updated",
        imageUrl: "https://example.com/profile.jpg",
        bannerUrl: "https://example.com/banner.jpg",
        genres: JSON.stringify(["house", "techno"]),
        mixcloudUsername: "djtest",
        soundcloudUsername: "djtest",
        instagram: "https://instagram.com/djtest",
        website: "https://example.com",
        twitter: "",
        facebook: "",
      }),
    );

    expect(result).toEqual({ status: "success" });
    expect(updateArtistProfile).toHaveBeenCalledWith({
      bio: "Updated",
      imageUrl: "https://example.com/profile.jpg",
      bannerUrl: "https://example.com/banner.jpg",
      genres: ["house", "techno"],
      mixcloudUsername: "djtest",
      soundcloudUsername: "djtest",
      // twitter/facebook were submitted blank, not omitted — see the
      // "clears a blank field" test below for why they're sent as "".
      socialLinks: {
        instagram: "https://instagram.com/djtest",
        website: "https://example.com",
        twitter: "",
        facebook: "",
      },
    });
    expect(
      JSON.stringify(vi.mocked(updateArtistProfile).mock.calls[0][0]),
    ).not.toContain("Malicious Rename");
    expect(
      JSON.stringify(vi.mocked(updateArtistProfile).mock.calls[0][0]),
    ).not.toContain("attacker@example.com");
  });

  it("parses genres from the hidden JSON field GenreTagInput writes", async () => {
    await updateArtistProfileAction(
      undefined,
      formData({ genres: JSON.stringify(["dub", "jungle", "  "]) }),
    );

    expect(updateArtistProfile).toHaveBeenCalledWith(
      expect.objectContaining({ genres: ["dub", "jungle"] }),
    );
  });

  it("treats malformed genres JSON as an empty list rather than crashing", async () => {
    const result = await updateArtistProfileAction(
      undefined,
      formData({ genres: "not json" }),
    );

    expect(result).toEqual({ status: "success" });
    expect(updateArtistProfile).toHaveBeenCalledWith(
      expect.objectContaining({ genres: [] }),
    );
  });

  it("sends a submitted-but-blank bio as '' rather than dropping it", async () => {
    // Regression: the previous optionalValue() mapped both "never touched"
    // and "cleared to blank" onto undefined, so a DJ could never blank out
    // their bio — the field silently kept its old value.
    await updateArtistProfileAction(undefined, formData({ bio: "" }));

    expect(updateArtistProfile).toHaveBeenCalledWith(
      expect.objectContaining({ bio: "" }),
    );
  });

  it("leaves imageUrl unset when the field isn't part of this submit at all", async () => {
    // ImageField renders no `imageUrl` input while showing the upload UI
    // (its default mode) — the field must come through as undefined, not "",
    // so the backend's PATCH allow-list leaves the just-uploaded image alone
    // instead of overwriting it with an empty string.
    const data = formData({ bio: "Updated" });
    expect(data.has("imageUrl")).toBe(false);

    await updateArtistProfileAction(undefined, data);

    expect(updateArtistProfile).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: undefined }),
    );
  });

  it("normalises a pasted profile URL or @handle before saving", async () => {
    await updateArtistProfileAction(
      undefined,
      formData({
        mixcloudUsername: "https://www.mixcloud.com/aerondarka/",
        soundcloudUsername: "@aeron-darka",
      }),
    );

    expect(updateArtistProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        mixcloudUsername: "aerondarka",
        soundcloudUsername: "aeron-darka",
      }),
    );
  });

  it("returns the backend error without revalidating when the update fails", async () => {
    vi.mocked(updateArtistProfile).mockResolvedValue({
      ok: false,
      code: "FORBIDDEN",
      message: "This profile can't be edited right now.",
    });

    const result = await updateArtistProfileAction(
      undefined,
      formData({ bio: "Updated" }),
    );

    expect(result).toEqual({
      status: "error",
      message: "This profile can't be edited right now.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("uploadArtistImageAction", () => {
  it("rejects a submit with no file", async () => {
    const result = await uploadArtistImageAction("profile", new FormData());

    expect(result).toEqual({
      status: "error",
      message: "Please choose an image file.",
    });
    expect(uploadArtistProfileImage).not.toHaveBeenCalled();
  });

  it("uploads the file and revalidates on success", async () => {
    vi.mocked(uploadArtistProfileImage).mockResolvedValue({
      ok: true,
      data: { ...DEFAULT_PROFILE, imageUrl: "https://blob.example/photo.jpg" },
    });
    const body = new FormData();
    body.append("image", new File(["bytes"], "photo.jpg", { type: "image/jpeg" }));

    const result = await uploadArtistImageAction("profile", body);

    expect(uploadArtistProfileImage).toHaveBeenCalledWith(
      "profile",
      expect.any(File),
    );
    expect(result).toEqual({
      status: "success",
      profile: { ...DEFAULT_PROFILE, imageUrl: "https://blob.example/photo.jpg" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account/artist");
  });

  it("surfaces the backend's error message on failure", async () => {
    vi.mocked(uploadArtistProfileImage).mockResolvedValue({
      ok: false,
      code: "INVALID_RESPONSE",
      message: "Something went wrong. Please try again.",
    });
    const body = new FormData();
    body.append("image", new File(["bytes"], "photo.jpg", { type: "image/jpeg" }));

    const result = await uploadArtistImageAction("profile", body);

    expect(result).toEqual({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("lookupUsernameAction", () => {
  it("reports found with a display name", async () => {
    vi.mocked(lookupArtistUsername).mockResolvedValue({
      ok: true,
      data: { status: "found", displayName: "Aeron Darka" },
    });

    await expect(lookupUsernameAction("mixcloud", "aerondarka")).resolves.toEqual({
      status: "found",
      displayName: "Aeron Darka",
    });
  });

  it("passes through not_found — a valid, saveable state", async () => {
    vi.mocked(lookupArtistUsername).mockResolvedValue({
      ok: true,
      data: { status: "not_found" },
    });

    await expect(lookupUsernameAction("soundcloud", "nobody")).resolves.toEqual({
      status: "not_found",
    });
  });

  it("degrades a failed lookup to 'unavailable', never 'not_found'", async () => {
    vi.mocked(lookupArtistUsername).mockResolvedValue({
      ok: false,
      code: "NETWORK_ERROR",
      message: "We couldn't reach Voices. Please try again shortly.",
    });

    await expect(lookupUsernameAction("mixcloud", "aerondarka")).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("skips the call entirely for a blank username", async () => {
    await expect(lookupUsernameAction("mixcloud", "   ")).resolves.toEqual({
      status: "unavailable",
    });
    expect(lookupArtistUsername).not.toHaveBeenCalled();
  });
});
