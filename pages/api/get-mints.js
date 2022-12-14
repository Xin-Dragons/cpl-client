import axios from "axios";

export default async function handler(req, res) {
  const { collection, limit, page, orderBy, publicKey, collectionFilter } = req.query
  try {
    const options = {
      params: {
        limit,
        page,
        orderBy,
        publicKey,
        collectionFilter
      }
    }

    const path = collection ? `collections/${collection}/mints` : `wallet/${publicKey}/mints`

    const { data } = await axios.get(`${process.env.API_URL}/${path}`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}