import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import type { NextPage } from "next";
import { Layout } from '../components'
import { useRouter } from 'next/router'
import Head from "next/head";
import Link from "next/link";
import Image from 'next/image'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import toast from 'react-hot-toast'
import { getAllMints } from '../helpers/db'
import Pagination from '@mui/material/Pagination';
import { Nfts, Modal } from '../components'
import { getDebtRepaymentTransactions, hashify } from '../helpers'
import { getNftsByOwner } from '../helpers'
import styles from "../styles/Home.module.scss";
import classnames from "classnames";
import axios from 'axios'

const connection = new Connection('https://ssc-dao.genesysgo.net/', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000
})

function Status({ signature, mint, done }) {
  const [status, setStatus] = useState('processing');

  async function confirmTransaction() {
    try {
      await axios.post('/api/mark-transaction', { mint, signature });
      const status = await connection.confirmTransaction(signature)
      setStatus('done');
      await axios.post('/api/confirm-restore', { mint, signature });
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

function Turdify({ nfts, closeModal, collection, refresh }) {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState(nfts.map(() => null));

  const totalDebt = nfts.reduce((sum, nft) => sum + nft.debt, 0)

  function done(index) {
    setSignatures(signatures.map((signature, i) => {
      if (index === i) {
        return true
      }
      return signature
    }))
  }

  useEffect(() => {
    if (signatures.every(sig => sig === true)) {
      refresh()
    }
  }, [signatures])

  function onCancelClick(e) {
    e.preventDefault();
    closeModal()
  }

  async function deturdify(e) {
    e.preventDefault()
    try {
      const transactions = await getDebtRepaymentTransactions({ publicKey: wallet.publicKey, nfts })

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
      console.log(err)
      toast.error(err.message)
    }
  }

  return <>
    <div className={classnames(styles.grid, styles.nftgrid)}>
      <div className={classnames(styles.turdifywrap)}>
        <div className={classnames(styles.selectedlist)}>

          {
            nfts.map((nft, index) => {
              return (
                <div key={nft.mint} className={classnames(styles.nftsmall)}>
                  <div className={classnames(styles.selecteditem)}>
                    <img src={`https://cdn.magiceden.io/rs:fill:200:200:0:0/plain/${nft?.metadata?.image}`} />
                    <h3>{nft.name}</h3>
                    <h4>Debt: {nft.debt}</h4>
                  </div>
                  {
                    signatures[index] && <Status signature={signatures[index]} mint={nft.mint} done={() => done(index)} />
                  }
                </div>
              )
            })
          }
          <div>
            <h3>Total amount owning</h3>
            <h4>{totalDebt} SOL</h4>
          </div>
        </div>
        <div className={classnames(styles.nftbtnwrap)}>
          <a href="#" onClick={onCancelClick}>Cancel</a>
          {
            loading
              ? <a href="#" onClick={onCancelClick} className={classnames(styles.turdify)}>DONE</a>
              : (
                <a
                  href="#"
                  onClick={deturdify}
                  className={classnames(styles.turdify)}
                >
                  REPAY AND RESTORE
                </a>
              )
          }

        </div>
      </div>
    </div>
  </>
}

const Home: NextPage = ({ allMints: initialAllMints }) => {
  const wallet = useWallet();
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState([])
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(20)
  const [allMints, setAllMints] = useState(initialAllMints);
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [modalShowing, setModalShowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();

  async function lookupCollection() {
    setLoading(true)
    const res = await axios.post('/api/get-collections', { update_authority: wallet?.publicKey?.toString() })
    setLoading(false)
    const collection = res.data;

    if (collection) {
      return router.push(`/collection/${collection.slug}`)
    }
  }

  useEffect(() => {
    if (wallet.publicKey && wallet.connected) {
      lookupCollection()
    }
  }, [wallet.publicKey, wallet.connected])

  async function getMyNfts() {
    setLoading(true)
    const promises = (
      await getNftsByOwner(wallet?.publicKey?.toString())
    )
      .filter(nft => allMints.map(d => d.mint).includes(nft.mint))
      .map(async item => {
        const { data: metadata } = await axios.get(hashify(item.data.uri))
        const nft = allMints.find(d => d.mint === item.mint)
        return {
          ...nft,
          ...item,
          metadata
        }
      })

    const ownedNfts = await Promise.all(promises);
    setNfts(ownedNfts);
    setLoading(false)
  }

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      getMyNfts();
    }
  }, [allMints, wallet.connected, wallet.publicKey])

  async function refreshAllMints() {
    const { data: allMints } = await axios.get('/get-nfts');
    setAllMints(allMints)
  }

  useEffect(() => {
    const filtered = nfts.filter(item => filter === 'to-restore' ? item.turdified : true)
    setFiltered(filtered)
    setCount(filtered.length)
  }, [page, filter, nfts, limit])

  useEffect(() => {
    setCount(nfts.length)
  }, [nfts])

  useEffect(() => {
    if (wallet.publicKey && wallet.connected) {
      getMyNfts()
    }
  }, [wallet.connected, wallet.publicKey])

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

  const canDeturdify = selected.length && selected.some(mint => {
    const nft = nfts.find(n => n.mint === mint)
    return nft.turdified;
  })

  function toggleModal(e) {
    e.preventDefault()
    if (!canDeturdify) {
      return false
    }
    setModalShowing(!modalShowing);
  }

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
    <Layout page="restore">
      <div className={classnames(styles.grid)}>
        <h2 className={classnames(styles.pagetitle)}>
          Select NFTs that you would like to restore
        </h2>
      </div>
      {
        modalShowing && (
          <Modal setModalShowing={setModalShowing}>
            <Turdify
              nfts={nfts.filter(n => selected.includes(n.mint) && n.turdified)}
              closeModal={() => setModalShowing(false)}
              refresh={refreshAllMints}
            />
          </Modal>
        )
      }
      <div className={classnames(styles.grid)}>
        <Tabs
          value={filter}
          onChange={onFilterChange}
        >
          <Tab value="to-restore" label="To Restore" />
          <Tab value="all" label="Wallet" />
        </Tabs>
        <Nfts
          nfts={filtered.slice((page - 1) * limit, page * limit)}
          selected={selected}
          onNftClick={onNftClick}
          loading={loading}
        />
        {
          count > limit && (
            <Pagination
              count={Math.ceil(count / limit)}
              page={page}
              onChange={(event, value) => setPage(value)}
            />
          )
        }

        <div className={classnames(styles.nftbtnwrap)}>
          <a href="#" onClick={cancel}>Cancel</a>
          <a href="#" onClick={selectAll}>{allSelected ? 'DESELECT' : 'SELECT'} ALL</a>
          <a href="#" className={classnames(styles.turdify, { [styles.disabled]: !canDeturdify })} onClick={toggleModal}>RESTORE</a>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps() {
  const allMints = await getAllMints();
  return {
    props: {
      allMints
    }
  }
}