import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL);
const metaplex = new Metaplex(connection);

export async function getNft(mint) {
  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(mint) })
    .run();
  return nft;
}
