import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Dashboard, Layout } from "../../components"
import { MainTitle } from "../../components/MainTitle";
import { SalesTable } from "../../components/SalesTable/indes";
import { useData } from "../../context";
import { truncate } from "../../helpers";
import { getCollections } from "../../helpers/db";

const Wallet: FC = () => {
  const router = useRouter();
  const { publicKey } = router.query;

  function onPKClick() {
    const text = publicKey;
    navigator.clipboard.writeText(publicKey).then(() => {
      toast.success('Copied to clipboard');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });

  }

  return (
    <Layout page="wallet">
      <MainTitle onClick={onPKClick}>{truncate(publicKey)}</MainTitle>
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