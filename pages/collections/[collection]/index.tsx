import { useRouter } from 'next/router'
import { Container } from "@mui/system";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Dashboard, Layout } from "../../../components";
import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, stepClasses, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import { useData } from '../../../context';
import { FC } from 'react';
import { formatDate, truncate } from '../../../helpers';
import { SalesTable } from '../../../components/SalesTable/indes';

export default function Collection () {
  const { collectionInfo } = useData();
  return (
    <Layout page="collections">
      <Typography variant="h1" sx={{ fontWeight: 'bold', fontFamily: 'Raleway', fontVariationSettings: '"wght" 1000' }} color="primary" display="inline">{ collectionInfo.name }</Typography>
      <Dashboard />
      <SalesTable />
    </Layout>
  )
}

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      collection: ctx.params.collection
    }
  }
}