import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getCollection, getMints } from '../../helpers/db'
import type { NextPage } from "next";
import { Layout, Modal, Nfts, Nft } from '../../components'
import styles from "../../styles/Home.module.scss";
import { useState, useMemo, useEffect } from 'react'
import classnames from "classnames";
import { getNfts, getNft, getTransactions } from "../../helpers";
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import axios from 'axios'

const connection = new Connection('https://ssc-dao.genesysgo.net/', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000
})

function Status({ signature, turdified, mint, done }) {
  const [status, setStatus] = useState('processing');

  async function confirmTransaction() {
    try {
      const status = await connection.confirmTransaction(signature)
      setStatus('done');
      await axios.post('/api/confirm', { turdified, mint });
    } catch (err) {
      setStatus('fail')
      console.log('transaction timed out')
    } finally {
      done();
    }
  }

  useEffect(() => confirmTransaction(), [])

  return <img src={`/${status}.svg`} className={classnames(styles.tstatus)} />
}

function Turdify({ nfts, closeModal, collection, deturdify, refresh }) {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState(nfts.map(() => null));

  function done(index) {
    setSignatures(signatures.map((signature, i) => {
      if (index === i) {
        return true
      }
      return signature
    }))
  }

  useEffect(() => {
    console.log(signatures)
    if (signatures.every(sig => sig === true)) {
      refresh()
    }
  }, [signatures])

  function onCancelClick(e) {
    e.preventDefault();
    closeModal()
  }

  async function turdify(e) {
    e.preventDefault()
    try {
      const urls = deturdify
        ? nfts.map(item => ({ mint: item.mint, uri: item.metadata_url }))
        : (
          await axios.post('/api/turdify', { mints: nfts, publicKey: wallet.publicKey, collection })
        ).data

      const transactions = await getTransactions(urls, wallet.publicKey)

      const signed = await wallet.signAllTransactions(transactions)
      const promises = signed.map(async transaction => {
        const rawTransaction = transaction.serialize();
        return connection.sendRawTransaction(rawTransaction);
      })

      const allSigs = await Promise.all(promises)
      setLoading(true)
      setSignatures(allSigs)
    } catch (err) {
      setLoading(false)
      console.log(err.code)
      toast.error(err.message)
    }
  }

  return <>
    <div className={classnames(styles.grid, styles.nftgrid)}>
      <div className={classnames(styles.turdifywrap)}>
        <div className={classnames(styles.overlay)}>
          <div className={classnames(styles.overlayplaceholder)}>
            <Image src="/poop.png" width={310} height={310} />
          </div>
          <h4>Current Image Overlay</h4>
          <a href="#">Upload Custom Image</a>
        </div>
        <div className={classnames(styles.selectedlist)}>
          {
            nfts.map((nft, index) => {
              return (
                <div key={nft.mint} className={classnames(styles.nftsmall)}>
                  <div className={classnames(styles.selecteditem)}>
                    <img src={`https://cdn.magiceden.io/rs:fill:200:200:0:0/plain/${nft.metadata.image}`} />
                    <h3>{nft.name}</h3>
                  </div>
                  {
                    signatures[index] && <Status signature={signatures[index]} turdified={!deturdify} mint={nft.mint} done={() => done(index)} />
                  }
                </div>
              )
            })
          }
        </div>
        <div className={classnames(styles.nftbtnwrap)}>
          <a href="#" onClick={onCancelClick}>Cancel</a>
          {
            loading
              ? <a href="#" onClick={onCancelClick} className={classnames(styles.turdify)}>DONE</a>
              : (
                <a
                  href="#"
                  onClick={turdify}
                  className={classnames(styles.turdify)}
                >
                  { deturdify ? 'DETURDIFY' : 'TURDIFY' }
                </a>
              )
          }

        </div>
      </div>
    </div>
  </>
}

const Home: NextPage = ({ collection, nfts: initialNfts, count: initialCount }) => {
  const [collectionNft, setCollectionNft] = useState<Object>({});
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('all');
  const [nfts, setNfts] = useState(initialNfts)
  const [count, setCount] = useState(initialCount)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [modalShowing, setModalShowing] = useState(false)

  function toggleModal(e) {
    e.preventDefault()
    setModalShowing(!modalShowing);
  }

  async function fetchMeta() {
    const promises = nfts.map(async nft => {
      console.log(nft)
      if (nft.metadata) {
        return nft;
      }
      const { data: metadata } = await axios.get(nft.metadata.uri)
      return {
        ...nft,
        metadata: nft.json
      }
    })

    const fetched = await Promise.all(promises);
    setNfts(fetched.filter(item => {
      const hasDebt = item.metadata.attributes.find(att => att.trait_type === 'Debt')
      return hasDebt
    }))
  }

  useEffect(() => {
    if (nfts.find(nft => !nft.metadata)) {
      fetchMeta()
    }
  }, [nfts])

  async function loadCollection() {
    if (collection.lookup_type === 'collection') {
      const collectionNft = await getNft(collection.id)
      setCollection(collectionNft)
    } else {
      const nft = await getNft(nfts[0].mint)
      if (nft?.collection?.address) {
        const collectionNft = await getNft(nft.collection.address)
        setCollectionNft(collectionNft)
      } else {
        const collectionNft = {
          name: nft.name.split('#')[0].trim(),
          symbol: nft.symbol,
          image: nft.json.image
        }
      }
    }
  }

  async function refreshNfts() {
    const { data: { data = [], count } } = await axios.post('/api/get-nfts', { filter, limit, offset: (page - 1) * limit, collection: collection && collection.id })
    const allNfts = (
      await getNfts(data.map(item => item.mint), true)
    )
      .map(item => {
        const fromDb = data.find(d => d.mint === item.mint)
        return {
          ...item,
          ...fromDb
        }
      })
    setNfts(allNfts)
    setCount(count)
  }

  useEffect(() => {
    refreshNfts()
  }, [page, filter])

  useEffect(() => {
    loadCollection()
  }, [collection])

  function onFilterChange(e, newValue) {
    setFilter(newValue)
  }

  function cancel(e) {
    e.preventDefault();
    setSelected([])
  }

  function selectAll(e) {
    e.preventDefault();
    if (nfts.every(item => selected.includes(item.mint))) {
      setSelected([])
    } else {
      setSelected(nfts.map(n => n.mint))
    }
  }

  function onNftClick(mint) {
    if (selected.includes(mint)) {
      setSelected(selected.filter(s => s !== mint));
    } else {
      setSelected([
        ...selected,
        mint
      ])
    }
  }

  const allSelected = selected.length === nfts.length

  return (
    <Layout page="update">
      <div className={classnames(styles.grid)}>
        <h2 className={classnames(styles.pagetitle)}>
          { collectionNft.name }
        </h2>
      </div>
      {
        modalShowing && (
          <Modal setModalShowing={setModalShowing}>
            <Turdify
              nfts={nfts.filter(n => selected.includes(n.mint))}
              closeModal={() => setModalShowing(false)}
              collection={collection.id}
              deturdify={filter === 'turds'}
              refresh={refreshNfts}
            />
          </Modal>
        )
      }
      <div className={classnames(styles.grid)}>
        <Tabs
          value={filter}
          onChange={onFilterChange}
        >
          <Tab value="outstanding" label="To turdify" />
          <Tab value="all" label="All" />
          <Tab value="turds" label="Turds" />
        </Tabs>
        <Nfts
          nfts={nfts}
          onNftClick={onNftClick}
          selected={selected}
        />
        <Pagination
          count={count / limit}
          page={page}
          onChange={(event, value) => setPage(value)}
        />
        <div className={classnames(styles.nftbtnwrap)}>
          <a href="#" onClick={cancel}>Cancel</a>
          <a href="#" onClick={selectAll}>{allSelected ? 'DESELECT' : 'SELECT'} ALL</a>
          <a href="#" className={classnames(styles.turdify)} onClick={toggleModal}>
            {filter === 'turds' ? 'DETURDIFY SELECTED' : 'TURDIFY SELECTED' }
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps(ctx) {
  const collection = await getCollection({ slug: ctx.query.id })
  const { data = [], count } = await getMints({ collection: collection.id, limit: 20 })

  const allNfts = (
    await getNfts(data.map(item => item.mint), true)
  )
    .map(item => {
      const fromDb = data.find(d => d.mint === item.mint)
      return {
        ...item,
        ...fromDb
      }
    })

  // const promises = data.map(async item => {
  //   const nft = await getNft(item.mint)
  //   return {
  //     ...nft,
  //     metadata: nft.json
  //   }
  // })

  // const withData = await Promise.all(promises);

  return {
    props: {
      collection,
      nfts: allNfts,
      count
    }
  }
}
