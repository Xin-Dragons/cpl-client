import { restore } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint, signature } = req.body;

  await restore({ mint, signature });

  res.status(200).send('OK')
}