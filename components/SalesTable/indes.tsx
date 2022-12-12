import { Grid, Card, CardContent, Typography, Box, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { LAMPORTS_PER_SOL, Transaction, Connection, PublicKey } from '@solana/web3.js';
import { lamportsToSol, truncate } from "../../helpers";
import { FC, useEffect, useState } from "react";
import { useData } from "../../context";
import { formatDate } from "../../helpers";
import { MagicEdenImage } from "../MagicEdenImage";
import Spinner from "../Spinner";
import toast from "react-hot-toast";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import base58 from "bs58";
import { Metaplex } from "@metaplex-foundation/js";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string, 'confirmed');
const metaplex = new Metaplex(connection)

interface PayButtonProps {
  mint: string
}

const PayButton: FC<PayButtonProps> = ({ mint, onDebtRepaid }) => {
  
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    return null;
  }

  async function payRoyalties () {
    try {
      setLoading(true)
      if (!wallet) {
        return
      }
      const params = {
        publicKey: wallet?.publicKey?.toString(),
        mint 
      };
      const { data } = await axios.get('/api/get-repayment-transaction', { params })
      const txn = Transaction.from(base58.decode(data));
      const signed = await wallet?.signTransaction?.(txn);
      if (!txn.verifySignatures()) {
        throw new Error('Error signing transaction')
      }

      const rawTransaction = signed?.serialize();

      await axios.post('/api/send-repayment-transaction', { rawTransaction, publicKey: wallet?.publicKey?.toString(), mint })

      toast.success('You ROCK! Functionality restored', { icon: '👏' })

      onDebtRepaid()
      
    } catch (err: any) {
      const message = err.message || 'Error paying royalties for mint'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner small />
    </Box>
  }

  return <Button variant="outlined" onClick={payRoyalties}>Pay royalties</Button>
}

function MintRow({ mint, mintSort }) {
  const [image, setImage] = useState(mint.image)
  const [name, setName] = useState(mint.name || mint.meta_name)
  const [debt, setDebt] = useState(mint.outstanding_debt);
  const [royaltiesPaid, setRoyaltiesPaid] = useState(mint.royalties_paid);

  async function getMeta() {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint.mint) });
    setImage(nft.json.image);
    setName(nft.json.name)
  }

  useEffect(() => {
    if (!image || !name) {
      getMeta()
    }
  }, [mint.mint])

  function onDebtRepaid() {
    setDebt(0);
    setRoyaltiesPaid(mint.debt_lamports);
  }

  return (
    <TableRow>
      <TableCell>
        {
          image
            ? <MagicEdenImage width={75} height={75} src={image} />
            : <Spinner small />
          
        }
      </TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{formatDate(mint.sale_date)}</TableCell>
      <TableCell>◎
        {
          lamportsToSol(mintSort === 'royalties_paid' ? royaltiesPaid : debt)
        }
      </TableCell>
      <TableCell>
        <a href={`https://solscan.io/token/${mint.mint}`} target="_blank" rel="noreferrer">{truncate(mint.mint)}</a>
      </TableCell>
      <TableCell>
        <a href={`https://solscan.io/account/${mint.holder}`} target="_blank" rel="noreferrer">{truncate(mint.holder)}</a>
      </TableCell>
      <TableCell>
        {mint.buyer &&<a href={`https://solscan.io/account/${mint.buyer}`} target="_blank" rel="noreferrer">{truncate(mint.buyer)}</a>}
      </TableCell>
      {
        mintSort !== 'royalties_paid' && (
          <TableCell>
            {debt > 0 && <PayButton mint={mint.mint} onDebtRepaid={onDebtRepaid} />}
          </TableCell>
        )
      }
    </TableRow>
  )
}

export const SalesTable: FC = () => {
  const { mints, mintSort, setMintSort } = useData();
  
  function handleChange(e) {
    setMintSort(e.target.value);
  }

  return (
    <Grid container mt={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h4">Mints</Typography>
            <Box display="flex" alignItems="flex-end" justifyContent="flex-end">
              <FormControl>
                <InputLabel id="sort-by-label">Sort by</InputLabel>
                <Select
                  labelId="sort-by-label"
                  id="sort-by"
                  value={mintSort}
                  label="Sort by"
                  onChange={handleChange}
                >
                  <MenuItem value="royalties_paid">Highest royalty payments</MenuItem>
                  <MenuItem value="debt_lamports">Outstanding debt</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Last sale</TableCell>
                  <TableCell>
                    {
                      mintSort === 'royalties_paid' ? 'Royalties paid' : 'Outstanding debt'
                    }
                  </TableCell>
                  <TableCell>Mint address</TableCell>
                  <TableCell>Holder</TableCell>
                  <TableCell>Purchased by</TableCell>
                  {
                    mintSort !== 'royalties_paid' && <TableCell></TableCell>
                  }
                </TableRow>
              </TableHead>
              <TableBody>
              {
                mints.map(mint => <MintRow key={mint.mint} mint={mint} mintSort={mintSort} />)
              }
            </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}