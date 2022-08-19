import { PublicKey, Connection } from '@solana/web3.js';
import { programs } from '@metaplex/js'
const { metadata: { Metadata } } = programs;

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL);

export async function getTransactions(items, updateAuthority) {
  const promises = items.map(async item => {

    const mint = await Metadata.getPDA(new PublicKey(item.mint));
    const ownedMetadata = await Metadata.load(connection, mint)

    const metadataDataData = ownedMetadata.data.data;

    const newMetadataData = {
      ...metadataDataData,
      uri: item.uri
    };

    console.log(newMetadataData)

    const md = await Metadata.getPDA(item.mint);

    const tx = new programs.metadata.UpdateMetadata(
      { feePayer: updateAuthority },
      {
        metadata: md,
        updateAuthority,
        metadataData: new programs.metadata.MetadataDataData(newMetadataData)
      }
    )

  //
  //   tx.instructions.push(transferInstruction);
  //
  //   tx.feePayer = userWallet;
  //
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.setSigners(updateAuthority);
  //
  //   const signature = nacl.sign.detached(tx.serializeMessage(), keypair.secretKey);
  //
  //   tx.addSignature(keypair.publicKey, Buffer.from(signature));
  //
  //   return tx;
  // })
    return tx
  })

  const txns = await Promise.all(promises)
  return txns
}