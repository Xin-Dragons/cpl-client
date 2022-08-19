import { turdify } from '../../helpers/db'

export default async function handler(req, res) {
  const { mints, image, collection, publicKey } = req.body;

  const urls = await turdify({ mints, collection, publicKey, image });

  res.status(200).json(urls)
}