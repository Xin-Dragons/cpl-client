import { updateRestoreTxns } from '../../helpers/db'

export default async function handler(req, res) {
  const { items, collection } = req.body;

  await updateRestoreTxns({ collection, items });

  res.status(200).send('OK')
}