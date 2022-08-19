import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.scss";
import classNames from "classnames";

const Home: NextPage = () => {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>NAWWW YAWWW</title>
          <meta
            name="description"
            content="Set fees for NFT owners that sell trough YAWWW"
          />
          <link
            rel="preload"
            href="/Raleway-VariableFont_wght.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          ></link>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <div className={styles.hero}>
            <header className={styles.header}>
              <div className={styles.hgrid}>
                <div className={styles.headerblockmenu}>
                  <div className={styles.logo}>
                    <a href="/">NAWWW YAWWW</a>
                  </div>
                  <nav>
                    <ul>
                      <li>
                        <Link href="/">ADD PROJECT</Link>
                      </li>
                      <li className={styles.menuselected}>
                        <Link href="#">UPDATE COLLECTION</Link>
                      </li>
                      <li>
                        <Link href="/#about">RESTORE NFTS</Link>
                      </li>
                    </ul>
                  </nav>
                  <WalletMultiButton />
                </div>
              </div>
            </header>
          </div>
          <div className={classNames(styles.grid)}>
            <h2 className={classNames(styles.pagetitle, styles.tpagetitle)}>
              Turdify Selected NFTs
            </h2>
          </div>
          <div className={classNames(styles.grid, styles.nftgrid)}>
            <div className={classNames(styles.turdifywrap)}>
              <div className={classNames(styles.overlay)}>
                <div className={classNames(styles.overlayplaceholder)}></div>
                <h4>Current Image Overlay</h4>
                <a href="#">Upload Custom Image</a>
              </div>
              <div className={classNames(styles.selectedlist)}>
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/9226.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                  <img src="/done.svg" className={classNames(styles.tstatus)} />
                </div>
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    {" "}
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6136.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                  <img src="/fail.svg" className={classNames(styles.tstatus)} />
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/7765.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                  <img
                    src="/processing.svg"
                    className={classNames(styles.tstatus)}
                  />
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/7358.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/1902-dead.png" />
                    <h3>DeGod #92xsdsdszxz27</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/100-dead.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/9346.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/1085-dead.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/5455.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6567-dead.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>{" "}
                <div className={classNames(styles.nftsmall)}>
                  <div className={classNames(styles.selecteditem)}>
                    <img src="https://yawww.b-cdn.net/rs:fill:400:400:0:0/plain/https://metadata.degods.com/g/6739-dead.png" />
                    <h3>DeGod #9227</h3>
                  </div>
                </div>
              </div>
              <div className={classNames(styles.nftbtnwrap)}>
                <a href="">Cancel</a>
                <a
                  href="/turdify-selected"
                  className={classNames(styles.turdify)}
                >
                  START THE PROCESS
                </a>
              </div>
            </div>
          </div>
        </main>
        <div className={styles.btt}>
          <a href="#">
            <img src="/up-sign.svg" alt="back to top" />
          </a>
        </div>
        <footer className={styles.footer}>NAWWW YAWWW 2022</footer>
      </div>
    </>
  );
};

export default Home;
