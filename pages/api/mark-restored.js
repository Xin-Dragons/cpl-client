import { markRestored } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint } = req.body;

  await markRestored({ mint });

  res.status(200).send('OK')
}