import { updateNft } from '../../helpers/db'

export default async function handler(req, res) {
  const { mint, turdified } = req.body;

  await updateNft({ mint, turdified });

  res.status(200).send('OK')
}