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
import classNames from "classnames";
import { getNft, getTransactions } from "../../helpers";
import toast from 'react-hot-toast'
import Image from 'next/image'

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

  return <img src={`/${status}.svg`} className={classNames(styles.tstatus)} />
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
    <div className={classNames(styles.grid, styles.nftgrid)}>
      <div className={classNames(styles.turdifywrap)}>
        <div className={classNames(styles.overlay)}>
          <div className={classNames(styles.overlayplaceholder)}>
            <Image src="/poop.png" width={310} height={310} />
          </div>
          <h4>Current Image Overlay</h4>
          <a href="#">Upload Custom Image</a>
        </div>
        <div className={classNames(styles.selectedlist)}>
          {
            nfts.map((nft, index) => {
              return (
                <div key={nft.mint} className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src={`https://cdn.magiceden.io/rs:fill:200:200:0:0/plain/${nft.image}`} />
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
        <div className={classNames(styles.nftbtnwrap)}>
          <a href="#" onClick={onCancelClick}>Cancel</a>
          {
            loading
              ? <a href="#" onClick={onCancelClick} className={classNames(styles.turdify)}>DONE</a>
              : (
                <a
                  href="#"
                  onClick={turdify}
                  className={classNames(styles.turdify)}
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

const Home: NextPage = ({ collection, nfts, count }) => {
  const [collectionNft, setCollectionNft] = useState<Object>({});



  const [modalShowing, setModalShowing] = useState(false)

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

  function toggleModal(e) {
    e.preventDefault()
    setModalShowing(!modalShowing);
  }



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



  useEffect(() => {
    loadCollection()
  }, [collection])



  return (
    <Layout>
      <div className={classNames(styles.grid)}>
        <h2 className={classNames(styles.pagetitle)}>
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
      <Nfts nfts={nfts} count={count} toggleModal={toggleModal} collection={collection} />
    </Layout>
  );
};

export default Home;

export async function getServerSideProps(ctx) {
  const collection = await getCollection({ slug: ctx.query.id })
  const { data, count } = await getMints({ collection: collection.id, limit: 20 })

  return {
    props: {
      collection,
      nfts: data,
      count
    }
  }
}
