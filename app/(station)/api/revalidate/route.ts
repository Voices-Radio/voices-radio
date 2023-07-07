import { env } from "@/env";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { SanityDocument } from "next-sanity";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const headersList = headers();

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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

async function streamToString(stream: ReadableStream<Uint8Array>) {
  const chunks = [];

  const reader = stream.getReader();

  let { done, value } = await reader.read();

  do {
    if (value !== undefined) chunks.push(value);
    ({ done, value } = await reader.read());
  } while (!done);

  return Buffer.concat(chunks).toString("utf8");
}
