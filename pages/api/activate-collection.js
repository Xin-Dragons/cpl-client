import { activateCollection } from "../../helpers/db";
import { isValidSignature } from "../../helpers";

export default async function handler(req, res ) {
  const { publicKey, signedMessage, usingLedger, mints, collection } = req.body;

  const isValid = isValidSignature({ publicKey, signedMessage, usingLedger });

  if (!isValid) {
    return res.status(500).json({ message: "Unauthorized" });
  }

  const model = await activateCollection({ mints, collection, publicKey });

  res.status(200).json(model);
}
