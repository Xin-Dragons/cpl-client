import axios from "axios";

export default async function handler(req, res) {
  const { collection } = req.query
  try {
    const headers = {
      Authorization: `Bearer ${process.env.API_SECRET_KEY}`
    };
    const path = collection ? `collections/${collection}` : 'collections/collection-info'
    const { data } = await axios.get(`${process.env.API_URL}/${path}`, { headers });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}