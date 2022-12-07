import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import axios from 'axios';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'finalized');
const metaplex = new Metaplex(connection);

export async function getNft(mint) {
  const nfts = await metaplex
    .nfts()
    .findAllByMintList({ mints: [new PublicKey(mint)] })

  if (!nfts[0]) {
    return {}
  }

  const { data: json } = await axios.get(nfts[0].uri)

  return {
    ...nfts[0],
    json
  }
}

export async function getNfts(mints, getMeta) {
  const nfts = await metaplex
    .nfts()
    .findAllByMintList({ mints: mints.map(mint => new PublicKey(mint)) })

  if (!getMeta) {
    return nfts;
  }

  const promises = nfts.filter(n => Boolean(n?.uri?.trim())).map(async nft => {
    const { data: metadata } = await axios.get(nft.uri)

    return {
      mint: nft.mintAddress.toString(),
      metadata
    }
  })

  return Promise.all(promises)
}

export async function getNftsByOwner(wallet) {
  const nfts = await getParsedNftAccountsByOwner({
    publicAddress: new PublicKey(wallet),
    connection
  })

  return nfts;
}