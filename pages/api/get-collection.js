import { getCollection } from '../../helpers/db'

export default async function handler(req, res) {
  const { update_authority } = req.body;

  const collection = await getCollection({ update_authority });

  res.status(200).json(collection)
}