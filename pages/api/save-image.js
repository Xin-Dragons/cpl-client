import { saveImage } from '../../helpers/db'

export default async function handler(req, res) {
  const { collection, image } = req.body;

  await saveImage({ collection, image });

  res.status(200).send('OK')
}