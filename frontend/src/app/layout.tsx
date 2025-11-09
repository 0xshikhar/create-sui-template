import type { Metadata } from "next";
import "@/styles/globals.css";
import "@mysten/dapp-kit/dist/index.css";
import { Providers } from "./providers";
import Navbar from "@/components/navigation/navbarapp";

export const metadata: Metadata = {
  title: "Create Sui Template",
  description: "App Router base layout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
