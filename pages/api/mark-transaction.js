import { markTransaction } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint, signature } = req.body;

  await markTransaction({ mint, signature });

  res.status(200).send('OK')
}