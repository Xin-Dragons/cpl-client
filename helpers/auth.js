import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

export const isValidSignature = ({ signedMessage, usingLedger, publicKey }) => {
  if (usingLedger) {
    const transaction = Transaction.from(bs58.decode(signedMessage));
    const isVerifiedSignature = transaction.verifySignatures();

    if (isVerifiedSignature) {
      return true;
    }

    return false;
  } else {
    const obj = { publicKey };
    const message = `Sign message to confirm you own this wallet and are validating this action\n\n${publicKey}`;

    const messageBytes = new TextEncoder().encode(message);

    const publicKeyBytes = bs58.decode(publicKey);
    const signatureBytes =
      typeof signedMessage === "string"
        ? new Uint8Array(bs58.decode(signedMessage))
        : new Uint8Array(signedMessage.data);

    const validated = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (validated) {
      return true;
    } else {
      return false;
    }
  }
};
