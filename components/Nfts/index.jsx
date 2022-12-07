import classnames from 'classnames'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { getNft, formatDate } from '../../helpers'
import { Nft, Spinner } from '../';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ToggleButton from '@mui/material/ToggleButton';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import styles from './style.module.scss'

function TableRowNft({ nft: initialNft }) {
  const [nft, setNft] = useState(initialNft);

  useEffect(() => {
    if (!nft.metadata) {
      console.log('getting')
      console.log(nft)
      axios.get(nft.data.uri).then(res => {
        console.log('got')
        const metadata = res.data;
        setNft({
          ...nft,
          metadata
        })
      })
    }
  }, [])

  return (
    <TableRow>
      <TableCell>
        <Link href={`/collections/${nft?.collection?.slug}/mint/${nft.mint}`}>
          <a>
            <img width={50} height={50} src={`https://cdn.magiceden.io/rs:fill:400:400:0:0/plain/${nft?.metadata?.image}`} />
          </a>
        </Link>
      </TableCell>
      <TableCell>{nft.debt || 0}</TableCell>
      <TableCell>{nft.last_sale_date ? formatDate(nft.last_sale_date) : '-'}</TableCell>
      <TableCell>{nft.last_sale_date ? nft.debt ? <CloseIcon /> : <CheckIcon /> : '-'}</TableCell>
      <TableCell>{nft.name || nft?.data?.name || nft?.metadata?.name }</TableCell>
      <TableCell><Link href={`/collections/${nft?.collection?.slug}/mint/${nft.mint}`}><a>View mint</a></Link></TableCell>
    </TableRow>
  )
}

export function Nfts({
  nfts: initialNfts,
  selected,
  onNftClick,
  loading,
  collection,
  sort,
  setSort
}) {
  const [nfts, setNfts] = useState([...initialNfts]);
  const [view, setView] = useState('list');

  useEffect(() => {
    setNfts([...initialNfts])
  }, [initialNfts])

  const router = useRouter();

  function onClick(nft) {
    if (onNftClick) {
      return onNftClick(nft.mint)
    } else {
      router.push(`/collections/${nft.collection.slug}/mint/${nft.mint}`)
    }
  }

  return (
    <Container sx={{ border: '1px solid rgba(118, 15, 67, 0.3)', background: '#101010', borderRadius: '20px', padding: '15px' }}>

      <Box justifyContent={sort ? 'space-between' : 'flex-end'} alignItems="flex-end" display="flex" sx={{width: 1}} gutterBottom>
        {
          sort && (
            <ToggleButtonGroup
              color="primary"
              value={sort}
              exclusive
              onChange={(e, value) => value && setSort(value)}
              aria-label="Sort"
            >
              <ToggleButton value="debt">Largest debt</ToggleButton>
              <ToggleButton value="recent">Most recent sales</ToggleButton>
            </ToggleButtonGroup>
          )
        }

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, value) => value && setView(value)}
        >
          <ToggleButton value="list" aria-label="list">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="module" aria-label="module">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {
        loading && <div className={styles.spinnerWrapper}><Spinner /></div>
      }
      {
        nfts.length
          ? (
            view === 'list'
              ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Debt</TableCell>
                      <TableCell>Last sale</TableCell>
                      <TableCell>Royalties paid</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      nfts.map(nft => <TableRowNft nft={nft} />)
                    }
                  </TableBody>
                </Table>
              )
              : (
                <Grid container alignItems="top" justifyContent="center" mt={1} spacing={2}>
                  {
                    nfts.map(nft => <Grid item sm={2.4}><Nft nft={nft} key={nft.mint} selected={selected.includes(nft.mint)} onClick={() => onClick(nft)} /></Grid>)
                  }
                </Grid>
              )
          )
          : <h2>No NFTs found</h2>
      }

    </Container>
  )
}