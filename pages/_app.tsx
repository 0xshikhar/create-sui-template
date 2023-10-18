import '@/src/styles/globals.css'
import type { AppProps } from 'next/app'

import MainLayout from "../layout/mainLayout";
import { useRouter } from "next/router";

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { type SuiClientOptions } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WalletKitProvider } from '@mysten/wallet-kit';
import { PropsWithChildren } from 'react';


// Config options for the networks you want to connect to
// const networks = {
//   localnet: { url: getFullnodeUrl('localnet') },
//   mainnet: { url: getFullnodeUrl('mainnet') },
// } satisfies Record<string, SuiClientOptions>;

// const queryClient = new QueryClient();

// export default function App({ Component, pageProps }: PropsWithChildren) {
//   return (
//     <WalletKitProvider>
//       {/* <Component {...pageProps} /> */}
//       <div>hello world</div>
//     <WalletKitProvider />
//   );
// };

// interface AppProps {
//   Component: React.ComponentType;
//   pageProps: Record<string, any>;
// }

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <WalletKitProvider>
      <Component {...pageProps} />
    </WalletKitProvider>
  );
};

export default App;