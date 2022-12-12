import axios from "axios";

export default async function handler(req, res) {
  const { collection, publicKey } = req.query
  try {
    const options = {
      params: {
        publicKey
      }
    }
    const path = collection ? `collections/${collection}` : ''
    const { data } = await axios.get(`${process.env.API_URL}/royalties/${path}`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}