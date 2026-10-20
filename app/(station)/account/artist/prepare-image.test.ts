import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_UPLOAD_BYTES,
  prepareImageForUpload,
  SEND_AS_IS_BYTES,
} from "./prepare-image";

function fileOfSize(bytes: number, type = "image/png", name = "photo.png") {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("prepareImageForUpload", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a small file untouched", async () => {
    const file = fileOfSize(SEND_AS_IS_BYTES - 1);
    expect(await prepareImageForUpload(file)).toBe(file);
  });

  it("returns the original when the browser cannot resize", async () => {
    // jsdom has no createImageBitmap.
    const file = fileOfSize(SEND_AS_IS_BYTES + 1);
    expect(await prepareImageForUpload(file)).toBe(file);
  });

  it("shrinks a large photo to a smaller JPEG", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 4800, height: 3200, close: vi.fn() })),
    );
    const canvas = { width: 0, height: 0 } as Record<string, unknown>;
    const drawImage = vi.fn();
    canvas.getContext = () => ({ drawImage, fillRect: vi.fn(), fillStyle: "" });
    canvas.toBlob = (cb: (blob: Blob | null) => void) =>
      cb(new Blob([new Uint8Array(500_000)], { type: "image/jpeg" }));
    vi.spyOn(document, "createElement").mockReturnValue(
      canvas as unknown as HTMLCanvasElement,
    );

    const big = fileOfSize(6_000_000, "image/png", "banner.png");
    const result = await prepareImageForUpload(big);

    expect(result).not.toBe(big);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("banner.jpg");
    expect(result.size).toBeLessThanOrEqual(MAX_UPLOAD_BYTES);
    expect(canvas.width).toBe(2400);
    expect(canvas.height).toBe(1600);
  });
});
