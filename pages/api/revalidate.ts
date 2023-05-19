import type { NextApiRequest, NextApiResponse } from "next";
import { parseBody } from "next-sanity/webhook";

export { config } from "next-sanity/webhook";

export default async function revalidate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { isValidSignature, body } = await parseBody(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      const message = "Invalid signature";
      console.warn(message);
      res.status(401).json({ message });
      return;
    }

    // @ts-ignore
    const staleRoute = `/${body.slug.current}`;

    await res.revalidate(staleRoute);

    const message = `Updated route: ${staleRoute}`;
    console.log(message);
    return res.status(200).json({ message });
  } catch (err) {
    console.error(err);

    // @ts-ignore
    return res.status(500).json({ message: err.message });
  }
}
