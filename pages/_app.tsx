import '@/src/styles/globals.css'
import type { AppProps } from 'next/app'

import MainLayout from "../layout/mainLayout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  )
}
