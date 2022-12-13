import { Connection } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'confirmed');
export const metaplex = new Metaplex(connection);