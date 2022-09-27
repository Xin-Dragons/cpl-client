import { getNonce } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint } = req.query;
  const nonce = await getNonce({ mint });

  res.status(200).json(nonce)
}