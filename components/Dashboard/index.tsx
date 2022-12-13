import { Grid, Stack, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material"
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useData } from "../../context"
import { lamportsToSol, numberWithCommas } from "../../helpers"
import { PaidUnpaidChart } from "../PaidUnpaidChart"
import { truncate } from "../../helpers"
import CountUp from 'react-countup';

import styles from './style.module.scss'
import Link from "next/link";
import { lamports } from "@metaplex-foundation/js";
import { MagicEdenImage } from "../MagicEdenImage";
import { Box } from "@mui/system";
import Spinner from "../Spinner";
import { metaplex } from '../../helpers'
import { useEffect, useState } from "react";

function RecentSale({ item }) {
  const [image, setImage] = useState(item.image);

  async function getMeta() {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(item.mint) });
    setImage(nft?.json?.image);
  }

  useEffect(() => {
    if (!image) {
      getMeta()
    }
  }, [item.mint])

  return (
    <TableRow>
      <TableCell>
        {
          image
            ? <MagicEdenImage height={50} width={50} src={image} />
            : <Spinner small />
        }
      </TableCell>
      <TableCell>◎{item.sale_price}</TableCell>
      <TableCell>{lamportsToSol(item.royalties_paid || (item.settled && item.debt_lamports))}</TableCell>
    </TableRow>
  )
}

function RecentSales() {
  const { recentSales, recentSalesLoading } = useData();
  return (
    <CardContent>
      <Typography variant="h4" align="center" gutterBottom>Recent purchases</Typography>
      <Box sx={{ overflow: 'auto', height: '300px' }}>
        {
          recentSalesLoading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', height: '100%'}}><Spinner /></Box>
            : <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Royalties Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                recentSales.map((s, index) => <RecentSale item={s} key={index} />)
              }
            </TableBody>
          </Table>
        }
        
      </Box>
    </CardContent>
  )
}

function Leaderboard() {
  const { leaderboard, leaderboardLoading } = useData();
  return (
    <CardContent>
      <Typography variant="h4" align="center" gutterBottom>Leaderboard</Typography>
      <Box sx={{ overflow: 'auto', height: '300px' }}>
        {
          leaderboardLoading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', height: '100%'}}><Spinner /></Box>
            : <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet</TableCell>
                <TableCell>Avg %</TableCell>
                <TableCell>Total paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                leaderboard.map(item => {
                  return (
                    <TableRow key={item.public_key}>
                      <TableCell>
                        <Link href={`/wallet/${item.public_key}`}><a className={styles.link}>{truncate(item.public_key)}</a></Link></TableCell>
                      <TableCell>{(
                        (Number(item.total_paid / item.expected_royalties)) * 100
                        ).toFixed(2)}%</TableCell>
                      <TableCell>◎{(item.total_paid / LAMPORTS_PER_SOL).toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        }
      </Box>
    </CardContent>
  )
}

export function Dashboard({ showRecentSales, showTotalPaid }) {
  const { summary, collectionInfo } = useData();

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={4}>
        <PaidUnpaidChart all={true} />
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Card sx={{ height: '50%' }}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom>CPL Repaid</Typography>
              <Typography variant="h2" align="center" gutterBottom color="secondary">◎<CountUp duration={4} end={summary.repaid ? summary.repaid / LAMPORTS_PER_SOL : 0} useEasing={true} decimals={2} separator="," /></Typography>
            </CardContent>
          </Card>
          <Card sx={{ height: '50%' }}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom>{ showTotalPaid ? 'Total Royalties Paid' : 'NFTs Monitored' }</Typography>
              <Typography variant="h2" align="center" gutterBottom>
                {
                  showTotalPaid
                    ? <>◎<CountUp end={summary.paid ? summary.paid / LAMPORTS_PER_SOL : 0} duration={4} decimals={2} separator="," useEasing={true} /></>
                    : <CountUp end={collectionInfo.num_mints || 0} duration={4} separator="," useEasing={true} />
                  }
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: 390, overflow: 'hidden' }}>
          {
            showRecentSales
              ? <RecentSales />
              : <Leaderboard />
          }
          
        </Card>
      </Grid>
    </Grid>
  )
}