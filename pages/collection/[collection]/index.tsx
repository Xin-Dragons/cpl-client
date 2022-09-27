import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Connection, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WebBundlr } from "@bundlr-network/client";
import { getCollection, getMints, getRpcUrls } from '../../../helpers/db'
import type { NextPage } from "next";
import { Layout, Modal, Nfts, Nft, ActivityLog } from '../../../components'
import styles from "../../../styles/Home.module.scss";
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react'
import classnames from "classnames";
import { getNfts, getNft, getTransactions, getDeturdifyTransactions } from "../../../helpers";
import toast from 'react-hot-toast'
import Image from 'next/image'
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BigNumber from 'bignumber.js';
import { sample, pickBy } from 'lodash';
import bs58 from 'bs58';

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
  const [images, setImages] = useState([
    'https://fvncezpefoxrbaqqtanr.supabase.co/storage/v1/object/public/assets/default/poop.png',
    ...collection.images.map(img => img.uri)
  ]);
  const [file, setFile] = useState(null)
  const [type, setType] = useState('mark')
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInput = useRef();

  function onTypeChange(e, type) {
    setType(type);
  }

  function done(index) {
    setSignatures(signatures.map((signature, i) => {
      if (index === i) {
        return true
      }
      return signature
    }))
  }

  function onFileClick(e) {
    e.preventDefault();
    fileInput.current.click();
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

  function onFileChange(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    console.log(file)
  }, [file])

  async function turdify(e) {
    e.preventDefault()
    try {
      let urls;
      let image;
      if (deturdify) {
        urls = nfts.map(item => ({ mint: item.mint, uri: item.metadata_url }))
      } else {

        await getDeturdifyTransactions({ items: nfts, wallet, collection: collection.id });

        const bundlr = new WebBundlr('https://node1.bundlr.network', 'solana', wallet);
        await bundlr.ready();

        if (file) {
          const tags = [{
            name: 'Content-Type',
            value: file.type
          }];

          const imgTxn = bundlr.createTransaction(await file.arrayBuffer(), { tags })
          const size = imgTxn.size;
          const price = await bundlr.getPrice(size);
          const balance = await bundlr.getLoadedBalance();

          if (balance.isLessThan(price)) {

            const promise = bundlr.fund(balance.minus(price).multipliedBy(1.1));

            toast.promise(promise, {
              loading: 'Funding bundlr network for upload...',
              success: 'Confirmed',
              error: 'Error funding, please try again',
            });

            await promise
          }

          await imgTxn.sign();
          const id = imgTxn.id;
          const upload = imgTxn.upload()
          const ext = file.name.split('.')[1];

          image = `https://arweave.net/${id}?ext=${ext}`

          toast.promise(upload, {
            loading: 'Uploading image...',
            success: 'Image uploaded!',
            error: 'Error uploading, please try again',
          });

          await upload;
          await axios.post('/api/save-image', { image, collection: collection.id });
        }

        const txns = await Promise.all(
          nfts.map(async (nft, index) => {
            const { data: originalMetadata } = await axios.get(nft.metadata_url)
            const newJson = { ...originalMetadata };
            newJson.attributes = [
              ...nft.metadata.attributes.filter(att => att.trait_type !== 'CPL Debt'),
              {
                trait_type: nft.debt ? 'CPL Debt' : 'CPL Flagged',
                value: nft.debt || true
              }
            ];
            newJson.properties.files.push({
              uri: nft.metadata_url,
              type: 'text/json'
            });

            if (type === 'mask') {
              newJson.image = image || selectedImage || 'https://fvncezpefoxrbaqqtanr.supabase.co/storage/v1/object/public/assets/default/poop.png';
              newJson.description = 'This NFT has been masked as it was purchased from a zero fees marketplace. Visit https://cpl.wtf to pay your dues and restore :)'
            }

            const tags = [{
              name: 'Content-Type',
              value: 'text/json'
            }];

            return bundlr.createTransaction(JSON.stringify(newJson, null, 2), { tags })
          })
        )

        const total = (
          await Promise.all(
            txns.map(tx => bundlr.getPrice(tx.size))
          )
        ).reduce((sum, item) => {
          return sum.plus(item)
        }, new BigNumber(0))

        const balance = await bundlr.getLoadedBalance();
        if (balance.isLessThan(total)) {

          const promise = bundlr.fund(balance.minus(total).multipliedBy(1.1));

          toast.promise(promise, {
            loading: 'Funding bundlr network for upload...',
            success: 'Confirmed',
            error: 'Error funding, please try again',
          });

          await promise
        }

        const promises = txns.map(async (txn, index) => {
          try {
            await txn.sign();
            const id = txn.id;
            const upload = txn.upload()

            const json = `https://arweave.net/${id}`

            toast.promise(upload, {
              loading: `Uploading metadata ${index + 1} of ${txns.length}...`,
              success: 'Uploaded!',
              error: 'Error uploading, please try again',
            });

            await upload;

            return {
              mint: nfts[index].mint,
              uri: json
            }
          } catch (err) {
            return;
          }
        })

        urls = (
          await Promise.all(promises)
        ).filter(Boolean);

        await axios.post('/api/update-meta', { items: urls, collection: collection.id });
      }

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
      console.log(err)
      setLoading(false)
      console.log(err.code)
      toast.error(err.message)
    }
  }

  function cancelFile(e) {
    e.preventDefault();
    setFile(null);
    setSelectedImage(null)
  }

  return <>
    <div className={classnames(styles.grid, styles.nftgrid)}>
      <div className={classnames(styles.turdifywrap)}>
        <div className={classnames(styles.overlay)}>
          {
            !deturdify ? (
              <>
                <Tabs
                  value={type}
                  onChange={onTypeChange}
                >
                  <Tab value="mark" label="Mark" />
                  <Tab value="mask" label="Mask" />
                </Tabs>
                <div className={styles.turdifyLeft}>
                  {
                    type === 'mask' && (
                      <>
                        <h4>Mask image and item description</h4>
                        <div className={classnames(styles.overlayplaceholder)}>
                          {
                            file || selectedImage
                              ? <Image src={file ? URL.createObjectURL(file) : selectedImage} width={310} height={310} />
                              : (
                                images.length > 1
                                  ? images.map(image => <Image key={image} src={image} width={100} height={100} onClick={() => setSelectedImage(image)} />)
                                  : <Image src={'/poop.png'} width={310} height={310} />
                              )

                          }

                          {
                            (file || selectedImage) && <div className={styles.imageOverlay}><a href="#" className={styles.close} onClick={cancelFile}>X</a></div>
                          }
                        </div>
                        <h4>Current Image Overlay</h4>
                        <input type="file" className={styles.hidden} ref={fileInput} onChange={onFileChange} />
                        <a href="#" onClick={onFileClick}>Upload Custom Image</a>
                      </>
                    )
                  }
                  {
                    type === 'mark' && (
                      <>
                        <h4>Mark NFTs without altering image</h4>
                        <div className={classnames(styles.overlayplaceholder, styles.fullHeight)}>
                          <p>Items with a debt will receive CPL Debt trait</p>
                          <pre>
                            {`{
  "trait_type": "CPL Debt",
  "value": 1.00
}`
                            }
                          </pre>
                          <p>Items without a debt will receive CPL Flagged trait</p>
                          <pre>
                            {`{
  "trait_type": "CPL Flagged",
  "value": true
}`
                            }
                          </pre>
                        </div>
                      </>
                    )
                  }
                </div>
              </>
            )
            : (
              <div className={styles.turdifyLeft}>
                <div className={classnames(styles.overlayplaceholder)}>
                  <h3>Restore selected</h3>
                </div>
              </div>
            )
          }

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
                  { deturdify ? 'RESTORE' : type.toUpperCase() }
                </a>
              )
          }

        </div>
      </div>
    </div>
  </>
}

const Home: NextPage = ({ collection, nfts: initialNfts, count: initialCount, rpcUrls, usingLedger = false }) => {
  const [collectionNft, setCollectionNft] = useState<Object>({});
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('all');
  const [nfts, setNfts] = useState(initialNfts)
  const [count, setCount] = useState(initialCount)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter();
  const wallet = useWallet()

  useEffect(() => {
    setSelected([])
  }, [page, filter])

  const [modalShowing, setModalShowing] = useState(false)

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && wallet.publicKey.toString() === collection.update_authority) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [wallet.connected, wallet.publicKey])


  function toggleModal(e) {
    e.preventDefault()
    setModalShowing(!modalShowing);
  }

  async function fetchMeta() {
    setLoading(true)
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
      const hasDebt = item.metadata.attributes.find(att => att.trait_type === 'CPL Debt')
      return hasDebt
    }))
    setLoading(false)
  }

  useEffect(() => {
    if (nfts.find(nft => !nft.metadata)) {
      fetchMeta()
    }
  }, [nfts])

  async function loadCollection() {
    let collectionNft;
    const nft = await getNft(nfts[0].mint)
    if (collection.lookup_type === 'collection') {
      collectionNft = await getNft(collection.id)
    } else {
      if (nft?.collection?.address) {
        collectionNft = await getNft(nft.collection.address)
      }
    }
    if (!collectionNft || collectionNft.name === 'Collection NFT') {
      collectionNft = {
        name: nft.name.split('#')[0].trim(),
        symbol: nft.symbol,
        image: nft?.json?.image
      }
    }
    setCollectionNft(collectionNft)
  }

  async function refreshNfts() {
    setLoading(true)
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
    setLoading(false)
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

  function onActionClick(e) {
    e.preventDefault();
    if (!selected.length) {
      return;
    }
    toggleModal(e)
  }

  async function markDelisted(e) {
    e.preventDefault();
    if (!selected.length) {
      return;
    }

    await axios.post('/api/mark-delisted', { mints: selected, collection: collection.id });

    await refreshNfts();

    if (!nfts.length) {
      setFilter('all')
    }
  }

  async function signTransaction() {
    if (wallet.publicKey) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 0,
        })
      );
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = wallet.publicKey;
      const signedTxn = await wallet?.signTransaction?.(transaction);
      return signedTxn;
    }
  }

  async function signMessage(params: object) {
    params = pickBy(params, Boolean);
    const message = `Sign message to confirm you own this wallet and are validating this action\n\n${wallet.publicKey.toString()}`;
    const encodedMessage = new TextEncoder().encode(message);
    if (!usingLedger) {
      const signedMessage = await wallet?.signMessage?.(encodedMessage);
      return bs58.encode(new Uint8Array(signedMessage || []));
    } else {
      const txn = await signTransaction();
      return txn;
    }
  }

  async function signup(e) {
    e.preventDefault();

    try {
      const params = {
        publicKey: wallet.publicKey.toString(),
      };
      const signedMessage = await signMessage(params);

      const headers = {
        "Content-Type": "application/json",
      };

      const data = {
        method: collection.lookup_type === 'collection' ? 'getNFTsByCollection' : 'getNFTsByCreator',
        jsonrpc: '2.0',
        params: [collection.id],
      };

      const { data: { result: nfts }} = await axios.post(sample(rpcUrls), data, { headers });

      const mints = nfts.map(nft => nft.metadata).map(nft => {
        return {
          mint: nft.mint,
          uri: nft.uri,
          name: nft.name
        }
      });

      await axios.post('/api/activate-collection', {
        ...params,
        signedMessage,
        usingLedger,
        mints,
        collection: collection.id,
      });
      toast.success('Collection activated')
      router.reload()
    } catch (err) {
      console.log(err)
      toast.error('Error adding collection, please try again')
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
        modalShowing && isAdmin && (
          <Modal setModalShowing={setModalShowing}>
            <Turdify
              nfts={nfts.filter(n => selected.includes(n.mint))}
              closeModal={() => setModalShowing(false)}
              collection={collection}
              deturdify={filter === 'restore'}
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
          <Tab value="sold" label="Sold" />
          <Tab value="listed" label="Listed" />
          <Tab value="all" label="All" />
          <Tab value="restore" label="Marked" />
          <Tab value="activity" label="Activity stream" />
        </Tabs>
        {
          filter === 'activity'
            ? <ActivityLog collection={collection.id} />
            : (
              <>
                <Nfts
                  nfts={nfts}
                  onNftClick={isAdmin ? onNftClick : null}
                  selected={selected}
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

                {
                  isAdmin && (
                    <div className={classnames(styles.nftbtnwrap)}>
                      {
                        collection.active
                          ? (
                            <>
                              <a href="#" onClick={cancel}>Cancel</a>
                              <a href="#" onClick={selectAll}>{allSelected ? 'DESELECT' : 'SELECT'} ALL</a>
                              {
                                filter === 'listed' && (
                                  <a href="#" className={classnames(styles.turdify, { [styles.disabled]: !selected.length })} onClick={markDelisted}>
                                    MARK DELISTED
                                  </a>
                                )
                              }
                              <a href="#" className={classnames(styles.turdify, { [styles.disabled]: !selected.length })} onClick={onActionClick}>
                                {filter === 'restore' ? 'RESTORE SELECTED' : 'MARK SELECTED' }
                              </a>
                            </>
                          )
                          : <a href="#" onClick={signup}>Monitor collection</a>
                      }

                    </div>
                  )
                }
              </>
            )
        }
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps(ctx) {
  const collection = await getCollection({ slug: ctx.query.collection })
  const { data = [], count } = await getMints({ collection: collection.id, limit: 20 })
  const rpcUrls = await getRpcUrls();

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

  return {
    props: {
      collection,
      nfts: allNfts,
      count,
      rpcUrls
    }
  }
}
