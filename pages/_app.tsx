import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { AppProps } from "next/app";
import { FC, useEffect, useMemo } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { DataProvider } from "../context";
import { subscribe, unsubscribe } from "../helpers";
import { TimeframeProvider } from "../context/timeframe";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: 'none',
      default: '#14141f'
    },
    primary: {
      main: '#E42575'
    },
    secondary: {
      main: '#00C49F'
    },
  },
});

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const network = WalletAdapterNetwork.Mainnet;

  useEffect(() => {
    subscribe();
    return () => {
      unsubscribe()
    }
  }, [])

  // You can also provide a custom RPC endpoint
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL as string;

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <ConnectionProvider endpoint={endpoint} config={{
        commitment: "confirmed",
        httpHeaders: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HELLO_MOON_API_KEY}`
        }
      }}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <TimeframeProvider>
              <DataProvider collection={pageProps.collection} publicKey={pageProps.publicKey}>
                <CssBaseline />
                <Component {...pageProps} />
              </DataProvider>
            </TimeframeProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default App;
