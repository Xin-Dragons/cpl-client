import Head from "next/head";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import styles from "./style.module.scss";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
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
        <Box borderBottom="1px solid #363650" width="100%">
          <Container>
            <Stack mt={7} direction={{ lg: 'row', sm: 'column' }} justifyContent="space-between" alignItems="center" width="100%" pb={1} pt={1} spacing={1}>
              <Typography fontWeight="bold" letterSpacing={0} fontSize={14}>Return of the Royalties</Typography>
              <Stack direction="row" spacing={0.5}>
                <Typography fontWeight="bold" textTransform="uppercase" fontSize={14} letterSpacing={0}>Stakooor</Typography>
                <Typography color="primary" fontWeight="bold" fontSize={14}>2.0</Typography>
              </Stack>
              <Stack direction={{ lg: 'row', sm: 'column' }} spacing={1}>
                <Typography textTransform="uppercase" fontSize={11} color="#E297B6" fontWeight="bold" textAlign="center">Royalty gated staking</Typography>
                <Typography textTransform="uppercase" fontSize={11} color="#E297B6" fontWeight="bold" textAlign="center">See and pay royalty debts instantly</Typography>
                <Typography textTransform="uppercase" fontSize={11} color="#E297B6" fontWeight="bold" textAlign="center">Emissions boost for paid royalties</Typography>
              </Stack>
              <Button variant="outlined" size="small" href="/stakooor.pdf" sx={{ lineHeight: '23px', fontWeight: 700, fontFamily: 'Raleway' }}>Learn more</Button>
              <Button variant="contained" size="small" href="https://www.xlabs.so/apply" target="_blank" sx={{ lineHeight: '23px', fontWeight: 700, fontFamily: 'Raleway' }}>Apply now</Button>
            </Stack>
          </Container>
        </Box>
        <Container>
          <Box mt={2}>{children}</Box>
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
