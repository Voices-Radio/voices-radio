import { env } from "@/env";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { SanityDocument } from "next-sanity";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  enforceRateLimit,
  PUBLIC_RATE_LIMITS,
} from "@/lib/voices/rate-limit";
import { NextResponse } from "next/server";

/**
 * The signature can only be checked after the whole body is in memory, so an
 * unauthenticated caller controls an allocation before any auth runs. Sanity's
 * webhook payload is a single document; 1 MB is generous for that.
 */
const MAX_BODY_BYTES = 1024 * 1024;

class BodyTooLargeError extends Error {}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, PUBLIC_RATE_LIMITS.revalidate);
  if (limited) return limited;

  try {
    const headersList = await headers();

    const declaredLength = Number(headersList.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return new NextResponse("Payload Too Large", { status: 413 });
    }

    const signatureHeader = headersList.get(SIGNATURE_HEADER_NAME);

    if (!signatureHeader) {
      return new NextResponse(`Missing '${SIGNATURE_HEADER_NAME}' Header`, {
        status: 400,
      });
    }

    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    const body = req.body && (await streamToString(req.body));

    if (!body) {
      return new NextResponse("Bad Input", { status: 400 });
    }

    if (!isValidSignature(body, signature, env.SANITY_REVALIDATE_SECRET)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { _type } = JSON.parse(body) as SanityDocument;

    const pathsToInvalidate = new Set<string>();

    switch (_type) {
      case "home":
      case "partner":
        pathsToInvalidate.add("/");

        break;
      case "about":
        pathsToInvalidate.add("/about");

        break;
      default:
        pathsToInvalidate.add("/about");
        pathsToInvalidate.add("/");

        break;
    }

    pathsToInvalidate.forEach((tag) => {
      revalidatePath(tag);
    });

    return NextResponse.json({
      success: true,
      revalidated: [...Array.from(pathsToInvalidate)],
    });
  } catch (err) {
    // An oversize body is the caller's fault, not ours — 413, and don't page
    // anyone over it.
    if (err instanceof BodyTooLargeError) {
      return new NextResponse("Payload Too Large", { status: 413 });
    }

    // Log the detail server-side only. Returning err.message leaked internals
    // to an unauthenticated caller, and the 200 status made Sanity record a
    // failed revalidation as a success instead of retrying it.
    console.error("Sanity revalidate failed:", err);

    return NextResponse.json(
      { success: false, message: "Revalidation failed." },
      { status: 500 },
    );
  }
}

/**
 * Reads the body, enforcing MAX_BODY_BYTES as it goes.
 *
 * The content-length check in POST() is a fast reject, not the guarantee — the
 * header is caller-declared and absent entirely on a chunked request. This is
 * where the cap actually holds.
 */
async function streamToString(stream: ReadableStream<Uint8Array>) {
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  const reader = stream.getReader();

  let { done, value } = await reader.read();

  do {
    if (value !== undefined) {
      receivedBytes += value.byteLength;

      if (receivedBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }

      chunks.push(value);
    }

    ({ done, value } = await reader.read());
  } while (!done);

  return Buffer.concat(chunks).toString("utf8");
}
