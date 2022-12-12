import { Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Dashboard, Layout } from "../../components"
import { MagicEdenImage } from "../../components/MagicEdenImage";
import { MainTitle } from "../../components/MainTitle";
import { SalesTable } from "../../components/SalesTable/indes";
import { useData } from "../../context";
import { formatDate, truncate } from "../../helpers";

const Wallet: FC = () => {
  const router = useRouter();

  const { publicKey } = router.query;
  const { mints, mintSort, setMintSort } = useData()

  function handleChange(e) {
    setMintSort(e.target.value);
  }

  return (
    <Layout page="wallet">
      <MainTitle>{truncate(publicKey)}</MainTitle>
      <Dashboard showRecentSales={true} showTotalPaid={true} />
      <SalesTable />
    </Layout>
  )
}

export default Wallet;

export async function getServerSideProps(ctx) {
  return {
    props: {
      publicKey: ctx.params.publicKey
    }
  }
}