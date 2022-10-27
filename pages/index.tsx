import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Layout, Spinner } from "../components";
import styles from "../styles/Home.module.scss";
import { getRpcUrls } from '../helpers/db';
import toast from "react-hot-toast";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { pickBy, sample } from "lodash";
import bs58 from "bs58";
import axios from "axios";

import { signMessage, signTransaction, getNft } from '../helpers'

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function Nft({ nft }) {
  const [metadata, setMetadata] = useState(nft.metadata);

  async function fetchMeta() {
    const res = await axios.get(nft.uri);
    setMetadata(res.data);
  }

  useEffect(() => {
    if (!metadata) {
      fetchMeta();
    }
  }, []);

  return (
    <div>
      {metadata && (
        <img
          src={metadata.image}
        />
      )}
    </div>
  );
}

const Home: NextPage = ({ usingLedger = false, rpcUrls }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState<number>(0);
  const [collection, setCollection] = useState<string | null>(null);
  const [collectionNft, setCollectionNft] = useState<Object | null>(null);
  const [collectionType, setCollectionType] = useState<string>('collection');
  const [nfts, setNfts] = useState<Array<Object>>([]);
  const [name, setName] = useState<string|null>(null);
  const [symbol, setSymbol] = useState<string|null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  async function lookupCollection() {
    setLoading(true)
    const res = await axios.post('/api/get-collection', { update_authority: wallet?.publicKey?.toString() })
    setLoading(false)
    const collection = res.data;

    if (collection) {
      return router.push(`/collection/${collection.slug}`)
    }
  }

  useEffect(() => {
    if (wallet.publicKey) {
      lookupCollection()
    }
  }, [wallet.publicKey])

  function nextSlide(e) {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey) {
      return;
    }
    const next = slide + 1;
    if (slides[next]) {
      setSlide(next);
    }
  }

  function prevSlide(e) {
    e.preventDefault();
    const prev = slide - 1;
    if (slides[prev]) {
      setSlide(prev);
    }
  }

  async function loadCollection() {
    const collectionNft = await getNft(collection);
    setCollectionNft(collectionNft);
  }

  useEffect(() => {
    if (collectionNft) {
      setSymbol(collectionNft.json.symbol)
      setName(collectionNft.json.name)
    } else if (nfts.length) {
      const nft = nfts[0];
      setSymbol(nft.symbol)
      setName(nft.name.split('#')[0])
    }
  }, [nfts, collectionNft])

  async function loadCollections(e) {
    try {
      if (!collection) {
        throw new Error(`Add the ${collectionType === 'collection' ? 'collection ID' : 'first verified creator'}`)
      }
      setLoading(true)
      if (collectionType === 'collection') {
        await loadCollection();
      }

      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      e.preventDefault();
      if (!collection) {
        toast.error("Enter collection ID");
      }

      const headers = {
        "Content-Type": "application/json",
      };

      const data = {
        method: collectionType === 'collection' ? 'getNFTsByCollection' : 'getNFTsByCreator',
        jsonrpc: '2.0',
        params: [collection],
      };

      const res = await axios.post(sample(rpcUrls), data, {
        headers,
      });
      const nfts = res.data.result;

      if (!nfts.length) {
        throw new Error(
          "Error looking up collection, try adding a mint list instead"
        );
      }

      const publicKey = wallet.publicKey.toString();
      const firstUa = nfts[0].metadata.update_authority;

      if (publicKey !== firstUa) {
        throw new Error(`Connect with ${firstUa} to add this collection.`);
      }

      const validEntries = nfts.filter(
        (nft) => nft.metadata.update_authority === publicKey
      );
      toast(`${validEntries.length} NFTs can be protected`);

      setNfts(validEntries.map((n) => n.metadata));
      setSlide(slide + 1);
    } catch (err) {
      console.log(err)
      const message = err?.message || err;
      toast.error(message);
    } finally {
      setLoading(false)
    }
  }

  async function confirmCollection() {
    try {
      if (!collection || !nfts.length) {
        throw new Error('Missing params')
      }
      setLoading(true)
      const params = {
        publicKey: wallet.publicKey.toString(),
      };
      const signedMessage = await signMessage(params);
      const slug = name?.toLowerCase().replace(/\s+/, "-").trim();
      const mints = nfts.map(nft => {
        return {
          mint: nft.mint,
          uri: nft.uri,
          name: nft.name
        }
      });
      const res = await axios.post("/api/create", {
        ...params,
        signedMessage,
        usingLedger,
        mints,
        slug,
        collection,
        collectionType
      });

      const model = res.data;
      router.push(`/collection/${model.slug}`);
    } catch (err) {
      toast.error(err.message)
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  const slides = [
    <>
      <h1>
        <span>Creator</span> Protection League
      </h1>
      <h2>
        Your Project, Your Choice! Connect UA Wallet in order to set fees for
        NFT owners who trade without creator royalties
      </h2>
      <div className={classnames(styles.boxbtnwrap)}>
        <WalletMultiButton />{" "}
        <a href="#" onClick={nextSlide} className={classnames({ [styles.disabled]: !wallet.connected || !wallet.publicKey })}>
          Next Step <img src="/right-sign.svg" />
        </a>
      </div>
    </>,
    <>
      <h1>
        <span>LOAD</span> collection
      </h1>
      <h2>{`Enter the ${collectionType === 'collection' ? 'Metaplex certified collection ID' : 'first verified creator ID'} to lookup all mints`}</h2>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Lookup by</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          value={collectionType}
          onChange={e => setCollectionType(e.target.value)}
          name="radio-buttons-group"
          row
        >
          <FormControlLabel value="collection" control={<Radio />} label="Collection" />
          <FormControlLabel value="creator" control={<Radio />} label="First verified creator" />
        </RadioGroup>
      </FormControl>
      <TextField
        label={collectionType === 'collection' ? 'Collection' : 'First verified creator'}
        variant="outlined"
        value={collection}
        onChange={(e) => setCollection(e.target.value)}
        fullWidth
        sx={{mb: 2}}
      />
      <div className={classnames(styles.boxbtnwrap)}>
        <a href="#" onClick={loadCollections}>
          Load Collection <img src="/right-sign.svg" />
        </a>
      </div>
    </>,
    <>
      <h1>
        <span>CONFIRM</span> collection
      </h1>

      <dl className={styles.inline}>
        <dt>Collection name</dt>
        <dd>{name}</dd>
        <dt>Symbol</dt>
        <dd>{symbol}</dd>
        <dt>Collection Size</dt>
        <dd>{nfts.length}</dd>
      </dl>

      <h3>Confirm you want add this collection to CPL</h3>

      {!!nfts.length && (
        <div className={styles.miniGrid}>
          {nfts.slice(0, 6).map((nft, index) => (
            <Nft key={index} nft={nft} />
          ))}
        </div>
      )}
      <div className={classnames(styles.boxbtnwrap)}>
        <a href="#" onClick={confirmCollection}>
          Confirm <img src="/right-sign.svg" />
        </a>
      </div>
    </>,
  ];

  const hasNext = slides[slide + 1];
  const hasPrev = slides[slide - 1];

  return (
    <Layout page="add">
      <div className={styles.hero}>
        <div className={classnames(styles.grid, styles.mheight)}>
          <div
            className={classnames(styles.nextstep, styles.prevstep, {
              [styles.disabled]: !hasPrev || !wallet.connected || !wallet.publicKey,
            })}
            onClick={prevSlide}
          >
            <a href="#">
              <img src="/right-sign.svg" />
            </a>
          </div>
          <div className={classnames(styles.boxwrap)}>
            {
              loading && <div className={styles.spinnerWrapper}><Spinner /></div>
            }
            {
              slides[slide]
            }
          </div>
          <div
            className={classnames(styles.nextstep, {
              [styles.disabled]: !hasNext || !wallet.connected || !wallet.publicKey,
            })}
            onClick={nextSlide}
          >
            <a href="#">
              <img src="/right-sign.svg" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps() {
  const rpcUrls = await getRpcUrls();

  return {
    props: {
      rpcUrls
    }
  }
}
