import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import axios from 'axios';
import { hashify } from './';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'finalized');
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
    const { data: metadata } = await axios.get(hashify(nft.uri))

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