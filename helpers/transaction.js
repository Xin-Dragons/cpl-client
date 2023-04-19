import {
  PublicKey,
  Keypair,
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  NONCE_ACCOUNT_LENGTH,
  TransactionInstruction,
  NonceAccount
} from '@solana/web3.js';
import { programs } from '@metaplex/js'
const { metadata: { Metadata } } = programs;
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import toast from 'react-hot-toast';
import axios from 'axios'

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, {
  commitment: "confirmed",
  httpHeaders: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HELLO_MOON_API_KEY}`
  }
});

export async function getRestoreTxn({ mint }) {
  return Transaction.from(bs58.decode(mint.restore_txn))
}

export async function getDebtRepaymentTransaction({ publicKey, nft, debt }) {
  const creators = nft.creators.filter(c => c.share > 0);

  const instructions = creators.map(creator => {
    const lamports = Math.ceil(debt / 100 * creator.share * LAMPORTS_PER_SOL)
    return SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(creator.address),
      lamports
    })
  })

  const tx = new Transaction().add(...instructions)
  tx.feePayer = publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx
}

export async function getTransactions(items, updateAuthority) {
  const promises = items.map(async item => {
    const mint = await Metadata.getPDA(new PublicKey(item.mint));
    const ownedMetadata = await Metadata.load(connection, mint)

    const metadataDataData = ownedMetadata.data.data;

    const newMetadataData = {
      ...metadataDataData,
      uri: item.uri
    };

    const md = await Metadata.getPDA(item.mint);

    const tx = new programs.metadata.UpdateMetadata(
      { feePayer: updateAuthority },
      {
        metadata: md,
        updateAuthority,
        metadataData: new programs.metadata.MetadataDataData(newMetadataData)
      }
    )

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.setSigners(updateAuthority);

    return tx
  })

  const txns = await Promise.all(promises)
  return txns
}

export async function createNonceAccount({ wallet, item }) {
  if (item.nonce_account) {
    const accountInfo = await connection.getAccountInfo(new PublicKey(item.nonce_account));
    if (accountInfo) {

      const requiredLamports = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
      if (accountInfo.lamports >= requiredLamports) {
        return;
      }
    }
  }

  const nonceAccountAuth = Keypair.generate();
  const nonceAccount = Keypair.generate();

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        NONCE_ACCOUNT_LENGTH
      ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: nonceAccountAuth.publicKey
    })
  )

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet.publicKey;
  tx.sign(nonceAccount)

  return {
    tx,
    mint: item.mint,
    nonceAccountAuth,
    nonceAccountPubkey: nonceAccount.publicKey
  }
}

export async function createNonceAccounts({ wallet, items }) {
  const nonces = (
    await Promise.all(
      items.map(item => createNonceAccount({ wallet, item }))
    )
  )
    .filter(Boolean)

  if (!nonces.length) {
    return;
  }

  const signed = await wallet.signAllTransactions(nonces.map(n => n.tx));

  const sendPromises = signed.map(async (tx, index) => {
    const { nonceAccountAuth, nonceAccountPubkey, mint } = nonces[index];
    const sig = await connection.sendRawTransaction(tx.serialize());
    let confirmed = false;

    try {
      await connection.confirmTransaction(sig)
      confimed = true;

      const params = {
        mint,
        public_key: nonceAccountPubkey.toString(),
        nonce_account_auth: bs58.encode(nonceAccountAuth.secretKey),
      }

      await axios.post('/api/add-nonce', params);
    } catch {
      confirmed = false;
    }

    return {
      sig,
      mint,
      confirmed,
      nonceAccountAuth,
      nonceAccountPubkey
    }
  })

  const sendPromise = Promise.all(sendPromises)

  toast.promise(sendPromise, {
    loading: 'Confirming nonce transactions',
    success: 'Nonce transactions completed',
    error: 'Error confirming, please try again',
  });

  return sendPromise;
}

export async function clearNonce({ mint }) {
  const { data: nonce } = await axios.get('/api/get-nonce', { params: { mint } });
  if (!nonce) {
    return;
  }

  const nonceAccountAuth = Keypair.fromSecretKey(
    bs58.decode(
      nonce.nonce_account_auth
    )
  )
  const nonceAccountPubkey = new PublicKey(nonce.public_key);

  const accountInfo = await connection.getAccountInfo(nonceAccountPubkey);

  if (!accountInfo) {
    return;
  }

  const tx = new Transaction().add(
    SystemProgram.nonceWithdraw({
      authorizedPubkey: nonceAccountAuth.publicKey,
      lamports: accountInfo.lamports,
      noncePubkey: nonceAccountPubkey,
      toPubkey: process.env.NEXT_PUBLIC_DESTINATION_WALLET
    })
  )

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.setSigners(nonceAccountAuth.publicKey);
  tx.feePayer = nonceAccountAuth.publicKey;
  tx.sign(nonceAccountAuth)

  await connection.sendRawTransaction(tx.serialize())

}

export async function getDeturdifyTransactions({ items, wallet, collection }) {
  toast('Creating nonce accounts')

  await createNonceAccounts({ items, wallet });

  const promises = items.map(async item => {
    const { data: nonce } = await axios.get('/api/get-nonce', { params: { mint: item.mint } });
    if (!nonce) {
      return;
    }

    const nonceAccountAuth = Keypair.fromSecretKey(
      bs58.decode(
        nonce.nonce_account_auth
      )
    )
    const nonceAccountPubkey = new PublicKey(nonce.public_key);
    const nonceAccountInfo = await connection.getAccountInfo(nonceAccountPubkey);
    const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data)

    const mint = await Metadata.getPDA(new PublicKey(item.mint));
    const ownedMetadata = await Metadata.load(connection, mint)

    const metadataDataData = ownedMetadata.data.data;

    const newMetadataData = {
      ...metadataDataData,
      uri: item.metadata_url
    };

    const md = await Metadata.getPDA(item.mint);

    const tx = new programs.metadata.UpdateMetadata(
      { feePayer: wallet.publicKey },
      {
        metadata: md,
        updateAuthority: wallet.publicKey,
        metadataData: new programs.metadata.MetadataDataData(newMetadataData)
      }
    )

    tx.instructions.unshift(
      SystemProgram.nonceAdvance({
        noncePubkey: nonceAccountPubkey,
        authorizedPubkey: nonceAccountAuth.publicKey
      })
    )

    tx.recentBlockhash = nonceAccount.nonce;
    tx.feePayer = wallet.publicKey;

    tx.sign(nonceAccountAuth)

    return {
      tx,
      mint: item.mint
    };
  });

  const transactions = (await Promise.all(promises)).filter(Boolean)

  if (!transactions.length) {
    return;
  }

  toast('Pre-sign restore transactions');

  const signed = await wallet.signAllTransactions(transactions.map(t => t.tx))

  const patchedItems = signed.map((tx, index) => {
    const mint = transactions[index].mint;
    return {
      restore_txn: bs58.encode(tx.serialize()),
      mint
    }
  })

  await axios.post('/api/update-restore-txns', { items: patchedItems, collection });
}

export async function signTransaction(wallet) {
  if (wallet.publicKey) {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 0,
      })
    );
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = wallet.publicKey;
    const signedTxn = await wallet?.signTransaction?.(transaction);
    return signedTxn;
  }
}

export async function signMessage(wallet, usingLedger = false) {
  const message = `Sign message to confirm you own this wallet and are validating this action\n\n${wallet.publicKey.toString()}`;
  const encodedMessage = new TextEncoder().encode(message);
  if (!usingLedger) {
    const signedMessage = await wallet?.signMessage?.(encodedMessage);
    return bs58.encode(new Uint8Array(signedMessage || []));
  } else {
    const txn = await signTransaction();
    return txn;
  }
}