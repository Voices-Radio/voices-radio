import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/voices/membership/membership-mutations", () => ({
  updateProfile: vi.fn(),
}));

const { revalidatePath } = await import("next/cache");
const { updateProfile } = await import(
  "@/lib/voices/membership/membership-mutations"
);
const { updateProfileAction } = await import("./actions");

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(updateProfile).mockResolvedValue({
    ok: true,
    data: {
      displayName: "Ada",
      supporterWallOptIn: true,
      marketingConsent: false,
      address: null,
    },
  });
});

describe("updateProfileAction", () => {
  it("sends supporterWallOptIn: true and marketingConsent: false when only the wall checkbox is checked", async () => {
    await updateProfileAction(
      undefined,
      formData({ displayName: "Ada", supporterWallOptIn: "on" }),
    );

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Ada",
      supporterWallOptIn: true,
      marketingConsent: false,
      address: undefined,
    });
  });

  it("sends marketingConsent: true and supporterWallOptIn: false when only marketing is checked — independently controlled (contract §9)", async () => {
    await updateProfileAction(
      undefined,
      formData({ displayName: "Ada", marketingConsent: "on" }),
    );

    expect(updateProfile).toHaveBeenCalledWith({
      displayName: "Ada",
      supporterWallOptIn: false,
      marketingConsent: true,
      address: undefined,
    });
  });

  it("sends both false when neither checkbox is checked, rather than omitting the fields", async () => {
    await updateProfileAction(undefined, formData({ displayName: "Ada" }));

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ supporterWallOptIn: false, marketingConsent: false }),
    );
  });

  it("returns success and revalidates /account/profile", async () => {
    const result = await updateProfileAction(undefined, formData({ displayName: "Ada" }));

    expect(result).toEqual({ status: "success" });
    expect(revalidatePath).toHaveBeenCalledWith("/account/profile");
  });

  it("returns the backend's error message on failure, without revalidating", async () => {
    vi.mocked(updateProfile).mockResolvedValue({
      ok: false,
      code: "UNKNOWN",
      message: "Something went wrong. Please try again.",
    });

    const result = await updateProfileAction(undefined, formData({ displayName: "Ada" }));

    expect(result).toEqual({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a displayName over 80 characters without calling the backend", async () => {
    const result = await updateProfileAction(
      undefined,
      formData({ displayName: "x".repeat(81) }),
    );

    expect(result?.status).toBe("error");
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
