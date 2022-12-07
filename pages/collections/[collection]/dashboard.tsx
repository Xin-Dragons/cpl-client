import { Card, CardContent, Grid, Typography } from "@mui/material";
import { NextPage } from "next";
import CountUp from "react-countup";
import { getStats } from "../../../helpers/db";

const Item = ({ children, title }) => {
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

const Dashboard: NextPage = ({ stats }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={4}>
        <Item title="Total debt">
          <Typography variant="h3" color="text.disabled">
            ◎<CountUp end={stats.debt} duration={3} useEasing separator="," decimals={2} />
          </Typography>
        </Item>
      </Grid>
      <Grid item xs={4}>
        <Item title="NFTs with debt">
          <Typography variant="h3" color="text.disabled">
            <CountUp end={stats.mintsWithDebt} duration={3} useEasing separator="," />
          </Typography>
        </Item>
      </Grid>
      <Grid item xs={4}>
        <Item title="NFTs monitored">
          <Typography variant="h3" color="text.disabled">
            <CountUp end={stats.mints} duration={3} useEasing separator="," />
          </Typography>
        </Item>
      </Grid>
    </Grid>
  )
}

export async function getServerSideProps() {
  const stats = await getStats();

  return {
    props: {
      stats
    }
  }
}