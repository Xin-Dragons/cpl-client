import nextConnect from 'next-connect';
import multer from 'multer';
import { upload, turdify } from '../../helpers/db';

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.log(error)
    res.status(501).json({ error: `Something went wrong ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(multer({ storage: multer.memoryStorage() }).single('image'));

apiRoute.post(async (req, res) => {
  const file = req.file;
  const { mints, collection, publicKey } = req.body;
  const imagePath = await upload({ file, collection });

  const urls = await turdify({ mints, collection, publicKey, imagePath });
  res.status(200).json(urls)
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  }
};