import '@/src/styles/globals.css'
import type { AppProps } from 'next/app'

import MainLayout from "../layout/mainLayout";
import { useRouter } from "next/router";

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { type SuiClientOptions } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Config options for the networks you want to connect to
const networks = {
  localnet: { url: getFullnodeUrl('localnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
} satisfies Record<string, SuiClientOptions>;
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="localnet">
        <WalletProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// export default function App({ Component, pageProps }: AppProps) {
//   const router = useRouter()

//   return (
//     <MainLayout>
//       <Component {...pageProps} />
//     </MainLayout>
//   )
// }
