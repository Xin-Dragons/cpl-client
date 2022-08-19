import Head from "next/head";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./style.module.scss";

export function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>NAWWW</title>
        <meta
          name="description"
          content="Set fees for NFT owners that sell through YAWWW"
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

      <Toaster style={{ wordWrap: 'break-word' }}/>

      <header className={styles.header}>
        <div className={styles.hgrid}>
          <div className={styles.headerblockmenu}>
            <div className={styles.logo}>
              <a href="/">NAWWW</a>
            </div>
            <nav>
              <ul>
                <li className={styles.menuselected}>
                  <Link href="/">ADD PROJECT</Link>
                </li>
                <li>
                  <Link href="/update-collection">UPDATE COLLECTION</Link>
                </li>
                <li>
                  <Link href="/restore-nfts">RESTORE NFTS</Link>
                </li>
              </ul>
            </nav>
            <WalletMultiButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <div className={styles.btt}>
        <a href="#">
          <img src="/up-sign.svg" alt="back to top" />
        </a>
      </div>
      <footer className={styles.footer}>
        NAWWW {new Date().getFullYear()}
      </footer>
    </div>
  );
}
