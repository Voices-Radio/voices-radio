import { env } from "@/env";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseBody } from "next-sanity/webhook";
import { revalidatePath } from "next/cache";

export { config } from "next-sanity/webhook";

export default async function revalidate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { isValidSignature, body } = await parseBody(
      req,
      env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      const message = "Invalid signature";

      console.warn(message);

      return res.status(401).json({ message });
    }

    console.log(body);

    const staleRoute = `/`;

    revalidatePath(staleRoute);

    const message = `Updated route: ${staleRoute}`;

    console.log(message);

    return res.status(200).json({ message });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: (err as Error).message,
    });
  }
}
