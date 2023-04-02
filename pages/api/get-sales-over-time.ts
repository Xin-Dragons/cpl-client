import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { collection, days } = req.query;

  try {
    const options = {
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET_KEY}`
      },
      params: {
        days
      }
    }
    const { data } = await axios.get(`${process.env.API_URL}/collections/${collection}/sales-over-time`, options);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}