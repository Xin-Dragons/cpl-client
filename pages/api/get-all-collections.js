import axios from "axios";

export default async function handler(req, res) {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.API_SECRET_KEY}`
    };
    const { data } = await axios.get(`${process.env.API_URL}/all-collections`, { headers });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}