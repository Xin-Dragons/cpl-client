import axios from "axios";

export default async function handler(req, res) {
  const { publicKey, mint } = req.query
  try {
    const { data } = await axios.get(`${process.env.API_URL}/wallet/${publicKey}/get-repayment-transaction/${mint}`);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}