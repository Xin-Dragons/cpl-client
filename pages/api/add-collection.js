import axios from "axios";
import { pick } from "lodash";

export default async function handler(req, res) {
  const params = pick(req.body, [
    'signedMessage',
    'usingLedger',
    'name',
    'symbol',
    'slug',
    'collection',
    'updateAuthority',
    'firstVerifiedCreator',
    'image',
    'description',
    'publicKey'
  ])
  try {
    const { data } = await axios.post(`${process.env.API_URL}/collections`, params);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}