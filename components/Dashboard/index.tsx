import { Grid, Stack, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material"
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
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

function RecentSales() {
  const { recentSales } = useData();
  return (
    <CardContent>
      <Typography variant="h4" align="center" gutterBottom>Recent purchases</Typography>
      <Box sx={{ overflow: 'auto', height: '300px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Royalties Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              recentSales.map((s, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell><MagicEdenImage height={50} width={50} src={s.image} /></TableCell>
                    <TableCell>◎{s.sale_price}</TableCell>
                    <TableCell>{lamportsToSol(s.royalties_paid || (s.settled && s.debt_lamports))}</TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </Box>
    </CardContent>
  )
}

function Leaderboard() {
  const { leaderboard } = useData();
  return (
    <CardContent>
      <Typography variant="h4" align="center" gutterBottom>Leaderboard</Typography>
      <Box sx={{ overflow: 'auto', height: '300px' }}>
        <Table>
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
      </Box>
    </CardContent>
  )
}

export function Dashboard({ showRecentSales, showTotalPaid }) {
  const { summary } = useData();

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
                    : <CountUp end={summary.mints || 0} duration={4} separator="," useEasing={true} />
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