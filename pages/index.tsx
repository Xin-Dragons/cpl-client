import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Layout } from "../components";
import styles from "../styles/Home.module.scss";
import toast from "react-hot-toast";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { pickBy } from "lodash";
import bs58 from "bs58";
import axios from "axios";
import { getNft } from "../helpers";

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
          src={`https://cdn.magiceden.io/rs:fill:150:150:0:0/plain/${metadata.image}`}
        />
      )}
    </div>
  );
}

const Home: NextPage = ({ usingLedger = false }) => {
  const router = useRouter();
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
    const res = await axios.post('/api/get-collection', { update_authority: wallet?.publicKey?.toString() })

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

      const res = await axios.post(process.env.NEXT_PUBLIC_RPC_URL, data, {
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
      const message = err?.message || err;
      toast.error(message);
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

  async function confirmCollection() {
    try {
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
      console.log(err);
    }
  }

  const slides = [
    <>
      <h1>
        <span>YAWWW</span> Buster
      </h1>
      <h2>
        Your Project, Your Choice! Connect UA Wallet in order to set fees for
        NFT owners who sell through Yawww
      </h2>
      <div className={classNames(styles.boxbtnwrap)}>
        <WalletMultiButton />{" "}
        <a href="#" onClick={nextSlide}>
          Next Step <img src="/right-sign.svg" />
        </a>
      </div>
    </>,
    <>
      <h1>
        <span>LOAD</span> collection
      </h1>
      <h2>Enter the Metaplex Certified Collection id to lookup all mints</h2>
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
      <div className={classNames(styles.boxbtnwrap)}>
        <a href="#" onClick={loadCollections}>
          Load Collections <img src="/right-sign.svg" />
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

      <h3>Confirm you want add this collection to NAWWW</h3>

      {!!nfts.length && (
        <div className={styles.miniGrid}>
          {nfts.slice(0, 6).map((nft) => (
            <Nft nft={nft} />
          ))}
        </div>
      )}
      <div className={classNames(styles.boxbtnwrap)}>
        <a href="#" onClick={confirmCollection}>
          Confirm <img src="/right-sign.svg" />
        </a>
      </div>
    </>,
  ];

  const hasNext = slides[slide + 1];
  const hasPrev = slides[slide - 1];

  return (
    <Layout>
      <div className={styles.hero}>
        <div className={classNames(styles.grid, styles.mheight)}>
          <div
            className={classNames(styles.nextstep, styles.prevstep, {
              [styles.disabled]: !hasPrev,
            })}
            onClick={prevSlide}
          >
            <a href="#">
              <img src="/right-sign.svg" />
            </a>
          </div>
          <div className={classNames(styles.boxwrap)}>{slides[slide]}</div>
          <div
            className={classNames(styles.nextstep, {
              [styles.disabled]: !hasNext,
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
