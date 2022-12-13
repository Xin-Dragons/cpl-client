import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Layout } from "../components";
import { MainTitle } from "../components/MainTitle";

export default function WTF() {
  return <Layout page="wtf">
    <MainTitle>WTF?</MainTitle>
    <Grid container>
      <Grid item sm={12} md={8}>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF is it?</Typography>
              <Typography variant="h6">CPL is a system for monitoring and incentivising royalties payments.</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF does it do?</Typography>
              <Typography variant="h6">It analyses and aggregates royalty payments across all marketplaces in realtime and makes this data available in a pretty dashboard 💅. <br /><br />But more importanlty, it includes a fully-featured API for integration into any third party application, such as staking, verification etc.</Typography>
              <br />
              <Typography variant="h6">Outstanding royalty debts can be repaid in-app to restore any gated utility and/or activate any applicable bonuses. This is split as per the on-chain creators config. No txn fee is taken.</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF do I do with it?</Typography>
              <Typography variant="h6">As a project owner, I can easily see the highest royalty payments and loyal payers, should I wish to reward these absolute chads.</Typography>
              <br />
              <Typography variant="h6">I can use the data available to gate access to raffles, boost/disable staking emission, or come up with some other imaginative ways of rewarding holders.</Typography>
              <br />
              <Typography variant="h6">The CPL API is already integrated into XLabs Stakooor, gated raffles are in progress, we&apos;ll also be working with other utility providers to help them utilise data and repayment in other applications.</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF tech does it use?</Typography>
              <Typography variant="h6">CPL uses Helius&apos; Webhooks API to update sales for included projects in realtime, plus a background worker which uses Hyperspace&apos;s API for polling all sale transactions across all marketplaces - this makes sure nothing is missed during any server/api downtime.</Typography>
              <br />
              <Typography variant="h6">Every new sale is analysed by unwrapping the transaction and comparing the actual balance changes to the intended royalties from on-chain metadata. The difference is marked as a &quot;debt&quot; property.</Typography>
              <br />
              <Typography variant="h6">Royalty data is stored in a PostgreSQL database so it can be queried quickly without having to read on chain data.</Typography>
              <br />
              <Typography variant="h6">Special shout outs to Helius Labs and Hyperspace for letting me try out their APIs for free</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF I gotta do to be included?</Typography>
              <Typography variant="h6">We&apos;ll have an automatic sign up soon enough, but for now HMU on twitter @TheGentlemonke, gentlemonke@xindragons or The Gentlemonke#6969 on discord.</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF is with the included collections?</Typography>
              <Typography variant="h6">We added all collections already in our system: Stakooor, Rafflooor and Auctionooor customers so they can utilise this data in our applications. We then added a few high MC projects at random, and some from requests - ping me if you want your project to be added.</Typography>
              <br />
              <Typography variant="h6">CPL sales begin on 2022-10-19, any sales before this are not included.</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">WTF next?</Typography>
              <Typography variant="h6">Lots of stuff: gated rafflooor, some API documentation, lots of UI improvements and additions, search etc. I&apos;m also working with Simpl3r and Cynova to standardise external debt repayments and integrate these in the data we provide.</Typography>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
    
  </Layout>
}