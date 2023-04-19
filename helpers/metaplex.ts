import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, Nft, Sft } from "@metaplex-foundation/js";
import { getRpcs } from "./db";
import { sample } from "lodash";
import base58 from "bs58";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string, {
  commitment: "confirmed",
  httpHeaders: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HELLO_MOON_API_KEY}`
  }
});
export const metaplex = new Metaplex(connection);

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export async function getNft(mintAddress: string) {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
    return nft;
  } catch (err) {
    return null
  }

}

export async function getRandomMint(creator: string, retries = 3): Promise<Sft | Nft | null> {
  try {
    const mints = await getMintAddressesByFirstCreator(creator)
    const mint = sample(mints);
    return getNft(mint as string);
  } catch (err) {
    if (retries) {
      return getRandomMint(creator, retries - 1);
    }
    throw new Error('Error looking up from first verified creator')
  }
}

async function getMintAddressesByFirstCreator(firstCreatorAddress: string) {
  const rpcs = await getRpcs();
  const rpc = sample(rpcs);
  const connection = new Connection(rpc, 'confirmed');
  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      commitment: "finalized",
      dataSlice: { offset: 33, length: 32 },
      filters: [
        {
          memcmp: {
            offset: 326,
            bytes: firstCreatorAddress
          }
        },
        {
          memcmp: {
            offset: 358,
            bytes: "2"
          }
        }
      ]
    }
  );

  return metadataAccounts.map((metadataAccountInfo) => (
    base58.encode(metadataAccountInfo.account.data.slice(33, 33 + 32))
  ));
}