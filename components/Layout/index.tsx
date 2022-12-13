import Head from "next/head";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./style.module.scss";
import { Box, Container } from "@mui/material";
import { Burger } from "../Burger";
import { useState } from "react";
import classNames from "classnames";
import { style } from "@mui/system";

function Navigation({ page }) {
  return (
    <nav>
      <ul className={styles['nav-wrapper']}>
        <li className={classNames({ [styles.menuselected]: page === 'dashboard'} )}>
          <Link href="/"><a>DASHBOARD</a></Link>
        </li>
        <li className={classNames({ [styles.menuselected]: page === 'collections'} )}>
          <Link href="/collections"><a>COLLECTIONS</a></Link>
        </li>
        <li className={classNames({ [styles.menuselected]: page === 'wallet'} )}>
          <Link href="/wallet"><a>WALLET</a></Link>
        </li>
        <li className={classNames({ [styles.menuselected]: page === 'wtf'} )}>
          <Link href="/wtf"><a>WTF</a></Link>
        </li>
      </ul>
    </nav>
  )
}

function DesktopNav({ page }) {
  return (
    <div className={styles['header-wrapper']}>
      <div className={styles.logo}>
        <Link href="/">
          <a>CPL</a>
        </Link>
      </div>
      <Navigation page={page} />
      <WalletMultiButton />
    </div>
  )
}

function Header({ page }) {
  return (
    <header className={styles.header}>
      <div className={styles.mobile}>
        <MobileNav page={page} />
      </div>
      <div className={styles.desktop}>
        <DesktopNav page={page} />
      </div>
    </header>
  )
}

function MobileNav({ page }) {
  const [open, setOpen] = useState(false);

  function onChange(e) {
    setOpen(!open)
  }

  return (
    <div>
    <div className={styles['header-wrapper']}>
      <div className={styles.logo}>
        <Link href="/">
          <a>CPL</a>
        </Link>
      </div>
      <Burger open={open} onChange={onChange} />
    </div>
    {
      open && <>
        <div className={styles.wallet}><WalletMultiButton /></div>
        <Navigation page={page} />
      </>
    }
    </div>
  )
}

export function Layout({ children, page }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Creator Protection League</title>
        <meta
          name="description"
          content="Monitor and incentivise NFT royalty payment"
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

      <Header page={page} />
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
