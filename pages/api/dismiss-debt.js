import { dismissDebt, getCollectionByMint } from '../../helpers/db'
import { isValidSignature } from '../../helpers';

export default async function handler(req, res) {
  const { mint, signedMessage, usingLedger } = req.body;

  const collection = await getCollectionByMint({ mint });
  console.log(collection)
  const isValid = isValidSignature({ publicKey: collection.update_authority, signedMessage, usingLedger });
  console.log({ isValid })

  if (!isValid) {
    return res.status(401).send('Unauthorized');
  }

  await dismissDebt({ mint })

  res.status(200).send('OK')
}