import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/voices/membership/artist-profile-client", () => ({
  updateArtistProfile: vi.fn(),
}));

const { revalidatePath } = await import("next/cache");
const { updateArtistProfile } = await import(
  "@/lib/voices/membership/artist-profile-client"
);
const { updateArtistProfileAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateArtistProfile).mockResolvedValue({
    ok: true,
    data: {
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
    },
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
        genres: "house, techno",
        mixcloudUsername: "@djtest",
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
      mixcloudUsername: "@djtest",
      soundcloudUsername: "djtest",
      socialLinks: {
        instagram: "https://instagram.com/djtest",
        website: "https://example.com",
      },
    });
    expect(JSON.stringify(vi.mocked(updateArtistProfile).mock.calls[0][0])).not.toContain(
      "Malicious Rename",
    );
    expect(JSON.stringify(vi.mocked(updateArtistProfile).mock.calls[0][0])).not.toContain(
      "attacker@example.com",
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
