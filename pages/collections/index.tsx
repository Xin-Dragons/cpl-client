import { Button, Card, CardContent, Container, FormControlLabel, Grid, Modal, Stack, Switch, TextField, Typography } from "@mui/material";
import { SystemProgram, Transaction } from '@solana/web3.js';
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { Layout, Spinner } from "../../components";
import { MagicEdenImage } from "../../components/MagicEdenImage";
import { MainTitle } from "../../components/MainTitle";
import { useData } from "../../context";
import toast, { Toaster } from 'react-hot-toast'
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getNft, getRandomMint, truncate } from "../../helpers";
import axios from "axios";
import base58 from "bs58";
import { useRouter } from "next/router";
import { getCollection } from "../../helpers/db";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function namify(id) {
  return toTitleCase(
    id.replace(/-/g, ' ')
  )
}

function AddCollection() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [identifier, setIdentifier] = useState<string>('');
  const [collection, setCollection] = useState<string | null>(null)
  const [firstVerifiedCreator, setFirstVerifiedCreator] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [updateAuthority, setUpdateAuthority] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [validImage, setValidImage] = useState(false);
  const [usingLedger, setUsingLedger] = useState(false);
  const router = useRouter();

  function handleIdentifierChange(e: any) {
    setIdentifier(e.target.value)
  }

  function cancel() {
    setLoading(false);
    setIdentifier('')
    setCollection(null)
    setFirstVerifiedCreator(null)
    setName(null)
    setDescription(null)
    setImage(null)
    setUpdateAuthority(null)
    setSymbol(null)
    setSlug(null);
  }

  const isConnected = wallet.connected && wallet.publicKey;

  async function lookup() {
    try {
      setLoading(true)
      const collectionNft = await getNft(identifier)
      console.log(collectionNft)
      if (collectionNft && collectionNft.name !== 'Collection NFT') {
        const ua = collectionNft.updateAuthorityAddress.toString()
        if (wallet.publicKey?.toString() !== ua) {
          throw new Error(`Update authority for this collection is ${truncate(ua)}\n\nPlease connect with the update authority wallet to add collection`)
        }
        setUpdateAuthority(ua)
        setName(collectionNft.name || collectionNft?.json?.name || null);
        setDescription(collectionNft.name);
        setCollection(identifier)
        setFirstVerifiedCreator(collectionNft.creators.find(c => c.verified)?.address?.toString() || null)
        setImage(collectionNft?.json?.image || null)
        setSymbol(collectionNft.symbol)
      }
      if (!collectionNft || collectionNft.name === 'Collection NFT') {
        const mint = await getRandomMint(identifier)
        const ua = mint.updateAuthorityAddress.toString()
        if (wallet.publicKey?.toString() !== ua) {
          throw new Error(`Update authority for this collection is ${truncate(ua)}\n\nPlease connect with the update authority wallet to add collection`)
        }
        setUpdateAuthority(ua)
        const name =
          mint.json.collection?.name ||
          mint.json.collection?.family ||
          (mint.name || mint.json.name).split('#')[0]

        setName(name.trim())
        setImage(mint.json.image)
        setSymbol(mint.symbol)
        setCollection(null)
        setDescription(mint.json.description)
        setFirstVerifiedCreator(identifier)
      } else {
        throw new Error('Error looking up collection - please contact gentlemonke@xindragons.io');
      }
    } catch (err) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function signTransaction(): Promise<Transaction | undefined> {
    if (wallet.publicKey) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 0
        })
      )
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = wallet.publicKey;
      const signedTxn = await wallet?.signTransaction?.(transaction);
      return signedTxn;
    }
  }

  async function signMessage() {
    const message = `Sign message to confirm you own this wallet and are validating this action.\n\nnew-collection`
    const encodedMessage = new TextEncoder().encode(message);
    if (!usingLedger) {
      const signedMessage = await wallet?.signMessage?.(encodedMessage);
      return base58.encode(new Uint8Array(signedMessage || []));
    } else {
      const txn = await signTransaction();
      if (txn) {
        return base58.encode(txn.serialize());
      }
    }
  }

  async function addCollection() {
    try {
      if (!image || !validImage) {
        throw new Error('Invalid image for collection');
      }

      [
        name,
        symbol,
        slug
      ].forEach(item => {
        if (!item) {
          throw new Error('Missing params')
        }
      })

      if (!firstVerifiedCreator || !updateAuthority) {
        throw new Error('Something went wrong, please try again')
      }

      let coll = await getCollection({ id: slug });

      if (coll) {
        throw new Error(`${slug} already exists`)
      }

      coll = await getCollection({ collection })
      if (coll) {
        throw new Error(`Collection: ${truncate(coll)} already exists`)
      }

      coll = await getCollection({ firstVerifiedCreator })
      if (coll) {
        throw new Error(`First verified creator: ${truncate(firstVerifiedCreator)} already exists`)
      }

      setLoading(true);
      const signedMessage = await signMessage();
      const params = {
        signedMessage,
        usingLedger,
        name,
        symbol,
        slug,
        collection,
        updateAuthority,
        firstVerifiedCreator,
        image,
        description,
        publicKey: wallet?.publicKey?.toString()
      }
      const { data } = await axios.post('/api/add-collection', params)
      toast.success(`${name} added successfully.\n\nPlease wait a while for mints and sales to be backfilled.`);
      router.push(`/collections/${data.id}`);
    } catch (err: any) {
      const message = err.message || err.res?.data?.message || 'Error adding collection';
      toast.error(message);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (name) {
      setSlug(name?.toLowerCase().replace(/\s/g, '-'))
    }
  }, [name])

  async function lookupImage() {
    try {
      if (!image) {
        return setValidImage(false)
      }
      const res = await axios.get(image);
      setValidImage(true)
    } catch {
      setValidImage(false)
    }
  }

  useEffect(() => {
    lookupImage()
  }, [image])

  return (
    <Container maxWidth="sm">
      <Card sx={{ bgcolor: 'background.default' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Add collection</Typography>
            <Typography variant="body1">You must be connected as the collection&apos;s Update Authority</Typography>
            <Stack direction="row" justifyContent="space-between">
              <WalletMultiButton />
              <FormControlLabel control={<Switch checked={usingLedger} onChange={e => setUsingLedger(e.target.checked)} />} label="Using ledger" />
            </Stack>

            {
              isConnected && (
                <>
                  <TextField
                    id="identifier"
                    label="Collection or first verified creator hash"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    disabled={!!(collection || firstVerifiedCreator)}
                    fullWidth
                  />
                  {
                    loading
                      ? <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spinner /></Box>
                      : (
                        (collection || firstVerifiedCreator)
                          ? (
                            <>
                              <Stack direction="row" spacing={2}>
                                {
                                  validImage
                                    ? <MagicEdenImage src={image} height={128} width={128} />
                                    : <Box width={128} height={128} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Typography variant="h5" color="primary">Image</Typography>
                                    </Box>
                                }
                                <Stack spacing={2}>

                                  <Stack direction="row" spacing={2} justifyContent="space-between">
                                    <TextField
                                      id="name"
                                      label="Name"
                                      value={name}
                                      onChange={e => setName(e.target.value)}
                                      fullWidth
                                    />
                                    <TextField
                                      id="symbol"
                                      label="Symbol"
                                      value={symbol}
                                      onChange={e => setSymbol(e.target.value)}
                                    />
                                  </Stack>
                                  <TextField
                                    id="id"
                                    label="Slug"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                  />
                                </Stack>
                              </Stack>
                              <TextField
                                id="image"
                                label="Image URL"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                              />
                              <Stack spacing={2} direction="row" justifyContent="space-between">
                                <Button onClick={cancel}>Cancel</Button>
                                <Button variant="outlined" onClick={lookup}>Refetch</Button>
                                <Button variant="contained" onClick={addCollection}>Add collection</Button>
                              </Stack>
                              
                            </>
                          )
                          : <Button onClick={lookup} variant="contained" disabled={!isConnected || loading || !identifier}>Lookup</Button>
                        )
                  }
              </>
            )
          }
          
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default function Collections() {
  const { allCollections, allCollectionsLoading } = useData()
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  function handleChange(e) {
    setSearch(e.target.value)
  }

  function toggleModalOpen() {
    setModalOpen(!modalOpen)
  }

  const filtered = allCollections.filter(c => {
    const name = c.name || c.id;
    return !search || name.toLowerCase().includes(search.toLowerCase())
  });

  function showWarning() {
    window.alert('Currently collections can only be added by reaching out to the XLabs team - send an email to gentlemonke@xlabs.so <3')
  }
  
  return (
    <Layout page="collections">
      <Modal
        open={modalOpen}
        onClose={toggleModalOpen}
        sx={{display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'}}
      >
        <AddCollection />
      </Modal>
      <MainTitle>Collections</MainTitle>
      <Box mt={2}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth id="outlined-basic" label="Search" variant="outlined" value={search} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large" onClick={showWarning}>Add collection</Button>
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={2} mt={2}>
              {
                allCollectionsLoading
                  ? <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  }}><Spinner /></Box></Grid>
                  : filtered.length
                    ? filtered.map(c => {
                      return (
                        
                        <Grid item lg={3} md={4} sm={6} xs={12} key={c.id}>
                          <Link href={`/collections/${c.id}`}>
                            <a>
                            <Card>
                              <MagicEdenImage width="100%" height="100%" src={c.image} />
                              <CardContent>
                                <Typography variant="h5">{c.name || namify(c.id)}</Typography>
                              </CardContent>
                            </Card>
                            </a>
                          </Link>
                        </Grid>
                      )
                    })
                    : <Grid item xs={12}><Typography variant="h2" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>No collections found</Typography></Grid>
              }
              
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  )
}