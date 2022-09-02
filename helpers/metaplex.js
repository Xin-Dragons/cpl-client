import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import axios from 'axios';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL);
const metaplex = new Metaplex(connection);

export async function getNft(mint) {
  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(mint) })
    .run();
  return nft;
}

export async function getNfts(mints, getMeta) {
  const nfts = await metaplex
    .nfts()
    .findAllByMintList({ mints: mints.map(mint => new PublicKey(mint)) })
    .run();

  if (!getMeta) {
    return nfts;
  }

  const promises = nfts.map(async nft => {
    const { data: metadata } = await axios.get(nft.uri)

    return {
      mint: nft.mintAddress.toString(),
      metadata
    }
  })

  return Promise.all(promises)
}

export async function getNftsByOwner(wallet) {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    method: 'getNFTsByOwner',
    jsonrpc: '2.0',
    params: [wallet],
  };

  console.log('calling')

  const res = await axios.post(process.env.NEXT_PUBLIC_RPC_URL, data, {
    headers,
  });
  console.log('done')
  const nfts = res.data.result.map(item => item.metadata);

  return nfts;
}