import axios from "axios";

export default async function handler(req, res) {
  const { collection } = req.query
  try {
    const options = {
      params: {
        collection
      }
    }
    const { data } = await axios.get(`${process.env.API_URL}/collections/${collection}`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}