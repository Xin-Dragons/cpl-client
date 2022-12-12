import { getStats } from '../helpers/db';
import { useEffect, useState } from 'react';
import { Layout } from '../components'
import { subscribe, unsubscribe, numberWithCommas, truncate } from '../helpers';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { PaidUnpaidChart } from '../components/PaidUnpaidChart';
import { Dashboard } from '../components'
import { Card, CardContent, CardHeader, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useData } from '../context';
import { Stack } from '@mui/system';
import { useRouter } from 'next/router';
import { MainTitle } from '../components/MainTitle';
import { MagicEdenImage } from '../components/MagicEdenImage';

export default function Home() {
  const { collections } = useData()
  const router = useRouter()
  const goto = link => () => {
    router.push(link)
  }
  return (
    <Layout page="dashboard">
      
      <MainTitle>CPL</MainTitle>
      <Typography gutterBottom variant="h5">A smart tool for monitoring NFT royalty payments and evasion on the Solana blockchain</Typography>

      <Dashboard />
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4">Protected collections</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{fontSize: '1.3em'}}></TableCell>
                    <TableCell sx={{fontSize: '1.3em'}}>Collection</TableCell>
                    <TableCell sx={{fontSize: '1.3em'}}>Total Sales</TableCell>
                    <TableCell sx={{fontSize: '1.3em'}}>Royalties Evaded</TableCell>
                    <TableCell sx={{fontSize: '1.3em'}}>Royalties Paid</TableCell>
                    <TableCell sx={{fontSize: '1.3em'}}>Royalty Payment Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    collections.map(c => {
                      return (
                        <TableRow onClick={goto(`/collections/${c.id}`)} key={c.id} sx={{
                          cursor: 'pointer',
                          ':hover': {
                            '*': {
                              color: 'rgb(228, 37, 117)',
                            }
                          }}}>
                          <TableCell sx={{fontSize: '1.3em'}}>
                            <MagicEdenImage height={75} width={75} src={c.image} />
                          </TableCell>
                          <TableCell sx={{fontSize: '1.3em'}}>{c.name}</TableCell>
                          <TableCell sx={{fontSize: '1.3em'}}>◎{numberWithCommas(c.total_sales?.toFixed(2))}</TableCell>
                          <TableCell sx={{fontSize: '1.3em'}}>◎{numberWithCommas(c.total_debt?.toFixed(2))}</TableCell>
                          <TableCell sx={{fontSize: '1.3em'}}>◎{numberWithCommas(c.total_paid?.toFixed(2))}</TableCell>
                          <TableCell sx={{fontSize: '1.3em'}}>{(c.total_paid / c.total_debt * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                        
                      )
                    })
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}