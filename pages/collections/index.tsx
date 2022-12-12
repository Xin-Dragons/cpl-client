import { Button, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { Layout, Spinner } from "../../components";
import { MagicEdenImage } from "../../components/MagicEdenImage";
import { MainTitle } from "../../components/MainTitle";
import { useData } from "../../context";
import toast from 'react-hot-toast'
import Link from "next/link";

export default function Collections() {
  const { collections } = useData()
  const [search, setSearch] = useState('');
  function handleChange(e) {
    setSearch(e.target.value)
  }

  const filtered = collections.filter(c => {
    const name = c.name || c.id;
    return !search || name.toLowerCase().includes(search.toLowerCase())
  });
  
  return (
    <Layout page="collections">
      <MainTitle>Collections</MainTitle>
      <Box mt={2}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField fullWidth id="outlined-basic" label="Search" variant="outlined" value={search} onChange={handleChange} />
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large" onClick={() => toast('Coming soon...\n\nContact gentlemonke@xindragons.io to be added')}>Add collection</Button>
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={2} mt={2}>
              {
                collections.length
                  ? filtered.length
                    ? filtered.map(c => {
                      return (
                        
                        <Grid item xs={3} key={c.id}>
                          <Link href={`/collections/${c.id}`}>
                            <a>
                            <Card>
                              <MagicEdenImage width="100%" height="100%" src={c.image} />
                              <CardContent>
                                <Typography variant="h5">{c.name}</Typography>
                              </CardContent>
                            </Card>
                            </a>
                          </Link>
                        </Grid>
                      )
                    })
                    : <Grid item xs={12}><Typography variant="h2" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>No collections found</Typography></Grid>
                  : <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  }}><Spinner /></Box></Grid>
                
                  
              }
              
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  )
}