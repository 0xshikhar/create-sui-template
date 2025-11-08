"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletKitProvider } from "@mysten/wallet-kit";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletKitProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WalletKitProvider>
    </ThemeProvider>
  );
}
