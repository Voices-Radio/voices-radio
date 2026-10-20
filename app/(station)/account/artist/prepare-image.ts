/**
 * Server actions accept a limited body (see next.config.mjs), and a phone
 * photo is often larger. A photo over the limit makes the upload action throw,
 * so large images are shrunk in the browser first.
 */
export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
/** Under this size the file goes up exactly as the DJ chose it. */
export const SEND_AS_IS_BYTES = 900 * 1024;

const MAX_DIMENSION = 2400;
const JPEG_QUALITIES = [0.85, 0.7, 0.55];

function toJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
}

/**
 * Returns a file that fits the upload limit. If the browser cannot resize, or
 * resizing fails, the original is returned and the server decides.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= SEND_AS_IS_BYTES) return file;
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    // JPEG has no transparency: a transparent PNG would turn black.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    for (const quality of JPEG_QUALITIES) {
      const blob = await toJpegBlob(canvas, quality);
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
          type: "image/jpeg",
        });
      }
    }
  } catch {
    // Fall through: the original file is still a valid upload.
  }
  return file;
}
