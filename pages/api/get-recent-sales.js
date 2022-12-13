import axios from "axios";

export default async function handler(req, res) {
  const { publicKey, limit, offset } = req.query
  try {
    const options = {
      params: {
        publicKey,
        limit,
        offset
      }
    }
    const { data } = await axios.get(`${process.env.API_URL}/wallet/${publicKey}/recent-sales`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}