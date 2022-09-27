import { addNonce } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint, public_key, nonce_account_auth } = req.body;

  await addNonce({ mint, public_key, nonce_account_auth });

  res.status(200).send('OK')
}