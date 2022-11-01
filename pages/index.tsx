import { getStats } from '../helpers/db';
import { useEffect } from 'react';
import { Layout } from '../components'
import { subscribe, unsubscribe, numberWithCommas } from '../helpers';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CountUp from 'react-countup';

function Item({ children, title }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" color="primary.main" gutterBottom>
          { title }
        </Typography>
        { children }
      </CardContent>
    </Card>
  )
}

export default function Dashboard({ stats = {} }) {
  useEffect(() => {
    subscribe();

    return () => {
      unsubscribe();
    }
  }, [])
  return (
    <Layout page="dashboard">
      <Container>
        <Box mt={15}>
          <Typography variant="h3" color="primary.main" gutterBottom>Royalty evasion stats</Typography>
          <Grid container spacing={4}>
            <Grid xs={4}>
              <Item title="Total debt">
                <Typography variant="h3" color="text.disabled">
                  ◎<CountUp end={stats.debt} duration={3} useEasing separator="," decimals={2} />
                </Typography>
              </Item>
            </Grid>
            <Grid xs={4}>
              <Item title="NFTs with debt">
                <Typography variant="h3" color="text.disabled">
                  <CountUp end={stats.mintsWithDebt} duration={3} useEasing separator="," />
                </Typography>
              </Item>
            </Grid>
            <Grid xs={4}>
              <Item title="Projects monitored">
                <Typography variant="h3" color="text.disabled">
                  <CountUp end={stats.collections} duration={3} useEasing separator="," />
                </Typography>
              </Item>
            </Grid>
            <Grid xs={12}>
              <Item title="Worst affected">
                <Table>
                  <TableBody>
                    {
                      stats.collectionsWithDebt.map(collection => (
                        <TableRow>
                          <TableCell><img src={collection.image} width={50} height={50} /></TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '20px' }}>
                              <Link href={`/collections/${collection.slug}`}>
                                <a>{collection.name}</a>
                              </Link>
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '20px' }}>
                              ◎ {
                                numberWithCommas(
                                  collection.total_debt.toFixed(2)
                                )
                              }
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </Item>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps() {
  const stats = await getStats()

  return {
    props: {
      stats
    }
  }
}