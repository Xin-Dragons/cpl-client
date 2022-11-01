import { getMints } from '../../helpers/db'

export default async function handler(req, res) {
  const { limit, offset, filter, collection, onlyMints, sort } = req.body;

  const nfts = await getMints({ limit, offset, filter, collection, onlyMints, sort });

  res.status(200).json(nfts)
}