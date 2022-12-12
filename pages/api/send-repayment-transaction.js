import axios from "axios";

export default async function handler(req, res) {
  const { publicKey, mint, rawTransaction } = req.body;
  try {
    const params = {
      mint,
      rawTransaction
    }
    
    await axios.post(`${process.env.API_URL}/wallet/${publicKey}/send-repayment-transaction`, params);

    res.status(200).send('OK');
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}