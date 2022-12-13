import Head from "next/head";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./style.module.scss";
import { Box, Container } from "@mui/material";

export function Layout({ children, page }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Creator Protection League</title>
        <meta
          name="description"
          content="Set fees for NFT owners traded without royalties"
        />
        <link
          rel="preload"
          href="/Raleway-VariableFont_wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        ></link>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster style={{ wordWrap: 'break-word' }}/>

      <header className={styles.header}>
        <div className={styles.hgrid}>
          <div className={styles.headerblockmenu}>
            <div className={styles.logo}>
              <Link href="/">
                <a>CPL</a>
              </Link>
            </div>
            <nav>
              <ul>
                <li className={page === 'dashboard' && styles.menuselected}>
                  <Link href="/"><a>DASHBOARD</a></Link>
                </li>
                <li className={page === 'collections' && styles.menuselected}>
                  <Link href="/collections"><a>COLLECTIONS</a></Link>
                </li>
                <li className={page === 'wallet' && styles.menuselected}>
                  <Link href="/wallet"><a>WALLET</a></Link>
                </li>
                <li className={page === 'wtf' && styles.menuselected}>
                  <Link href="/wtf"><a>WTF</a></Link>
                </li>
              </ul>
            </nav>
            <WalletMultiButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Container>
          <Box mt={10}>{children}</Box>
        </Container>
      </main>
      <div className={styles.btt}>
        <a href="#">
          <img src="/up-sign.svg" alt="back to top" />
        </a>
      </div>
      <footer className={styles.footer}>
        CPL {new Date().getFullYear()}
      </footer>
    </div>
  );
}
