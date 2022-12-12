import axios from "axios";

export default async function handler(req, res) {
  const { limit } = req.query
  try {
    const options = {
      params: {
        limit
      }
    }
    const { data } = await axios.get(`${process.env.API_URL}/collections`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}