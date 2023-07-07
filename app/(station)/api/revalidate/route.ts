import { env } from "@/env";
import { NextApiRequest } from "next";
import { parseBody } from "next-sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export { config } from "next-sanity/webhook";

export async function POST(req: NextRequest, res: Response) {
  try {
    const { isValidSignature, body } = await parseBody(
      req as unknown as NextApiRequest,
      env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      const message = "Invalid signature";

      console.warn(message);

      return NextResponse.json({ message }, { status: 401 });
    }

    console.log(body);

    const staleRoute = `/`;

    revalidatePath(staleRoute);

    const message = `Updated route: ${staleRoute}`;

    console.log(message);

    return NextResponse.json({ message });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
