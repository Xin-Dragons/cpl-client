import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Dashboard, Layout } from "../../components"
import { MainTitle } from "../../components/MainTitle";
import { useData } from "../../context";
import { truncate } from "../../helpers";

const Wallet: FC = () => {
  const wallet = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      router.push(`/wallet/${wallet.publicKey.toString()}`);
    }
  }, [wallet.connected, wallet.publicKey])

  return (
    <Layout page="wallet">
      <MainTitle>Loading Wallet...</MainTitle>
    </Layout>
  )
}

export default Wallet;