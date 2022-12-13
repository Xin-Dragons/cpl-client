import { getStats } from '../helpers/db';
import { useEffect, useState } from 'react';
import { Layout, Spinner } from '../components'
import { subscribe, unsubscribe, numberWithCommas, truncate, lamportsToSol } from '../helpers';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { PaidUnpaidChart } from '../components/PaidUnpaidChart';
import { Dashboard } from '../components'
import { Card, CardContent, CardHeader, Pagination, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useData } from '../context';
import { Stack } from '@mui/system';
import { useRouter } from 'next/router';
import { MainTitle } from '../components/MainTitle';
import { MagicEdenImage } from '../components/MagicEdenImage';

export default function Home() {
  const { collections, page, setPage, collectionsLoading, limit, allCollections } = useData()
  const router = useRouter()
  const goto = link => () => {
    router.push(link)
  }

  function handlePageChange(e, page: number) {
    setPage(page)
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
              <Typography variant="h4">Protected collections by volume</Typography>
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
                {
                  collectionsLoading
                    ? <TableBody>
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Box mt={2} mb={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}><Spinner /></Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    : <TableBody>
                    {
                      collections.map(c => {
                        console.log(c)
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
                            <TableCell sx={{fontSize: '1.3em'}}>◎{lamportsToSol(c.total_debt)}</TableCell>
                            <TableCell sx={{fontSize: '1.3em'}}>◎{lamportsToSol(c.total_paid)}</TableCell>
                            <TableCell sx={{fontSize: '1.3em'}}>{(c.total_paid / c.expected_royalties * 100).toFixed(2)}%</TableCell>
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                }
              </Table>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} mt={2}>
                <Pagination count={Math.floor(allCollections.length / limit)} page={page} onChange={handlePageChange} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}