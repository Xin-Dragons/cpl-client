import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.API_SECRET_KEY}`
    };
    const { data } = await axios.get(`${process.env.API_URL}/collections/weekly-leaders`, { headers });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}