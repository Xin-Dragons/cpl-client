import { markDelisted } from '../../helpers/db'

export default async function handler(req, res) {
  const { mints, collection } = req.body;

  await markDelisted({ collection, mints });

  res.status(200).send('ok')
}