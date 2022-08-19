import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import type { NextPage } from "next";
import { Layout } from '../components'
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.scss";
import classNames from "classnames";

const Home: NextPage = () => {
  return (
    <Layout>
      <div className={classNames(styles.grid)}>
        <h2 className={classNames(styles.pagetitle)}>
          Select NFTs that you would like to restore
        </h2>
      </div>
      <div className={classNames(styles.grid, styles.nftgrid)}>
        <div className={classNames(styles.nftswrap)}>
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/9226.png" />
            <h3>DeGod #9227</h3>
          </div>
          <div className={classNames(styles.nft, styles.nftselected)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6136.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/7765.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/7358.png" />
            <h3>DeGod #9227</h3>
            <div className={classNames(styles.nftsold)}>SOLD ON ME</div>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/1902-dead.png" />
            <h3>DeGod #92xsdsdszxz27</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/100-dead.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/9346.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/1085-dead.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/5455.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6567-dead.png" />
            <h3>DeGod #9227</h3>
          </div>{" "}
          <div className={classNames(styles.nft)}>
            <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6739-dead.png" />
            <h3>DeGod #9227</h3>
          </div>
          <div className={classNames(styles.nftbtnwrap)}>
            <a href="">Cancel</a>
            <a href="">SELECT ALL</a>
            <a
              href="/turdify-selected"
              className={classNames(styles.turdify)}
            >
              Restore
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
