import { useRouter } from 'next/router'
import { Container } from "@mui/system";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Dashboard, Layout } from "../../../components";
import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, stepClasses, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import { useData } from '../../../context';
import { FC, useEffect, useState } from 'react';
import { formatDate, truncate } from '../../../helpers';
import { SalesTable } from '../../../components/SalesTable';
import { NextPage } from 'next';
import { SalesOverTime } from '../../../components/SalesOverTime';
import axios from 'axios';

interface CollectionProps {
  collection: string;
}

const Collection: NextPage<CollectionProps> = ({ collection }) => {
  const { collectionInfo } = useData();
  const [sales, setSales] = useState([]);

  async function getSalesOverTime() {
    const params = {
      collection
    };
    const { data } = await axios.get('/api/get-sales-over-time', { params })
    setSales(data)
  }

  useEffect(() => {
    getSalesOverTime()
  }, [])
  return (
    <Layout page="collections">
      <Typography variant="h1" sx={{ fontWeight: 'bold', fontFamily: 'Raleway', fontVariationSettings: '"wght" 1000' }} color="primary" display="inline">{ collectionInfo.name }</Typography>
      <SalesOverTime collection={collection} sales={sales} />
      <Dashboard />
      <SalesTable />
    </Layout>
  )
}

export default Collection;

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      collection: ctx.params.collection
    }
  }
}