import { getLogs } from '../../helpers/db';
import axios from 'axios';
import { getNft } from '../../helpers'

export default async function handler(req, res) {
  let { limit, offset, filter, collection } = req.query;
  if (limit) {
    limit = Number(limit)
  }
  if (offset) {
    offset = Number(offset)
  }
  const { logs, count } = await getLogs({ limit, offset, filter, collection });

  const promises = logs.map(async item => {
    const nft = await getNft(item.mint.mint);
    return {
      id: item.sig,
      mint: item.mint.mint,
      collection: item.mint.collection.slug,
      date: item.created_at,
      image: nft.json.image,
      name: nft.name || nft.json.name,
      type: item.type
    }
  })

  const mapped = await Promise.all(promises)

  res.status(200).json({ logs: mapped, count })
}