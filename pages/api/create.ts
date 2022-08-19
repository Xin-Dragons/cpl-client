// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createCollection } from "../../helpers/db";
import { isValidSignature } from "../../helpers";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { publicKey, signedMessage, usingLedger, slug, mints, collection, collectionType } =
    req.body;

  const isValid = isValidSignature({ publicKey, signedMessage, usingLedger });

  if (!isValid) {
    return res.status(500).json({ message: "Unauthorized" });
  }

  const model = await createCollection({ mints, slug, collection, type: collectionType, publicKey });

  res.status(200).json(model);
}
