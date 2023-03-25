import axios from "axios";

export default async function handler(req, res) {
  const { limit, page } = req.query
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`
      },
      params: {
        limit,
        page
      }
    }
    const { data } = await axios.get(`${process.env.API_URL}/collections`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}