import { requireStudioUser } from "@/lib/voices/studio-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const ALLOWED_IMAGE_HOSTS = [
  "thumbnailer.mixcloud.com",
  "sndcdn.com",
  "voicesradio.co.uk",
];

function isAllowedHostname(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();

  return ALLOWED_IMAGE_HOSTS.some(
    (allowedHostname) =>
      normalizedHostname === allowedHostname ||
      normalizedHostname.endsWith(`.${allowedHostname}`),
  );
}

function parseImageUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !isAllowedHostname(url.hostname)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

async function readLimitedBody(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("The upstream image response was empty.");
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("The upstream image exceeds the 12 MB limit.");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function GET(request: Request) {
  // SSRF controls below are sound, but an unauthenticated fetch primitive is
  // still an open proxy and bandwidth amplifier. Studio users only.
  const unauthorized = await requireStudioUser(request);
  if (unauthorized) return unauthorized;

  const incomingUrl = new URL(request.url);
  const imageUrl = parseImageUrl(incomingUrl.searchParams.get("url"));

  if (!imageUrl) {
    return NextResponse.json(
      { error: "This image host is not permitted for CMS imports." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
      headers: { Accept: "image/*" },
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json(
        { error: "Redirected image URLs are not permitted." },
        { status: 400 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `The image provider returned ${response.status}.` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type")?.split(";")[0];
    if (!contentType?.startsWith("image/") || contentType === "image/svg+xml") {
      return NextResponse.json(
        { error: "The selected URL did not return a supported raster image." },
        { status: 415 },
      );
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "The upstream image exceeds the 12 MB limit." },
        { status: 413 },
      );
    }

    const body = await readLimitedBody(response);

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Length": String(body.byteLength),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Voices CMS image proxy error:", error);

    return NextResponse.json(
      { error: "The selected image could not be imported." },
      { status: 502 },
    );
  }
}
