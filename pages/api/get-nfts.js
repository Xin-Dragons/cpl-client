import { getMints, getAllMints } from '../../helpers/db'
import { getNftsByOwner } from '../../helpers'

export default async function handler(req, res) {
  const { limit, offset, filter, collection, onlyMints, sort, mints } = req.body;

  if (mints) {
    const nfts = await getAllMints({ mints })
    return res.status(200).json(nfts)
  }

  const nfts = await getMints({ limit, offset, filter, collection, onlyMints, sort });

  res.status(200).json(nfts)
}