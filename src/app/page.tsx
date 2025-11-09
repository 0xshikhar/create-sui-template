"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { startZkLogin } from "@/lib/zklogin";

export default function HomePage() {
  const account = useCurrentAccount();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <section className="container mx-auto px-6 pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Production-ready Sui + zkLogin
          </div>
          
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
            Create Sui Template
          </h1>
          <p className="text-[14px] font-bold text-green-400">by 0xShikhar</p>

          <p className="mt-4 text-white/70 max-w-xl">
            Next.js App Router starter powered by Mysten Dapp Kit and Enoki. Connect a wallet or sign in with Google via zkLogin.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ConnectButton />
            <button
              onClick={() => startZkLogin("google")}
              className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium"
            >
              Sign in with Google (zkLogin)
            </button>
          </div>
          {account && (
            <div className="mt-3 text-sm text-white/70">Connected: {account.address}</div>
          )}
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 bg-blue-600/20 blur-3xl rounded-3xl" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <pre className="text-xs md:text-sm text-white/80 overflow-auto">
{`npm run dev    # Start dev server\nNEXT_PUBLIC_ENOKI_API_KEY=...  # Configure zkLogin\n`}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
