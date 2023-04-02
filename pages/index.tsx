import { getStats } from '../helpers/db';
import { useEffect, useState } from 'react';
import { Layout, Spinner } from '../components'
import { subscribe, unsubscribe, numberWithCommas, truncate, lamportsToSol } from '../helpers';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PaidUnpaidChart } from '../components/PaidUnpaidChart';
import { Dashboard } from '../components'
import { Card, CardContent, CardHeader, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useData } from '../context';
import { Stack } from '@mui/system';
import { useRouter } from 'next/router';
import { MainTitle } from '../components/MainTitle';
import { MagicEdenImage } from '../components/MagicEdenImage';
import { SalesOverTime } from '../components/SalesOverTime';

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
      <Typography gutterBottom variant="h5" sx={{ fontSize: { sm: '3vw', md: '30px' } }}>A smart tool for monitoring NFT royalty payments and evasion on the Solana blockchain</Typography>
      <Dashboard showWeeklyLeaders />
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4">Protected collections by volume</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}></TableCell>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>Collection</TableCell>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>Total Sales</TableCell>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>Royalties Evaded</TableCell>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>Royalties Paid</TableCell>
                      <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>Effective Rate</TableCell>
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
                              <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>{c.name}</TableCell>
                              <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>◎{numberWithCommas(c.total_sales?.toFixed(2))}</TableCell>
                              <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>◎{lamportsToSol(c.total_debt)}</TableCell>
                              <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>◎{lamportsToSol(c.total_paid)}</TableCell>
                              <TableCell sx={{fontSize: { xs: '0.8em', sm: '1em', md: '1.2em' }}}>{(c.total_paid / LAMPORTS_PER_SOL / c.total_sales * 100).toFixed(2)}%</TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  }
                </Table>
              </TableContainer>
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