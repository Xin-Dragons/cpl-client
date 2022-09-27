import { getCollections } from '../../helpers/db'

export default async function handler(req, res) {
  let { limit, offset, filter } = req.query;
  if (limit) {
    limit = Number(limit)
  }
  if (offset) {
    offset = Number(offset)
  }
  const { count, data: collections } = await getCollections({ limit, offset, filter });

  res.status(200).json({ count, collections })
}