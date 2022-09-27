import { debtPaid } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint, signature, publicKey } = req.body;

  await debtPaid({ mint, signature, publicKey });

  res.status(200).send('OK')
}