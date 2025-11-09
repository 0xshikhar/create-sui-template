"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { ConnectButton } from "@mysten/dapp-kit";
import { startZkLogin } from "@/lib/enoki";
import { useUnifiedAccount } from "@/hooks/useUnifiedAccount";

const style = {
  wrapper: `bg-black w-screen px-[1.2rem] py-[0.8rem] flex `,
  logoContainer: `flex items-center cursor-pointer`,
  logoText: ` ml-[0.8rem] text-white font-semibold text-2xl`,
  searchBar: `flex flex-1 mx-[0.8rem] w-max-[520px] items-center bg-[#363840] rounded-[0.8rem] hover:bg-[#4c505c]`,
  searchIcon: `text-[#8a939b] mx-3 font-bold text-lg`,
  searchInput: `h-[2.6rem] w-full border-0 bg-transparent outline-0 ring-0 px-2 pl-0 text-[#e6e8eb] placeholder:text-[#8a939b]`,
  headerItems: ` flex items-center align-right justify-end`,
  headerItem: `text-white px-4 font-bold text-[#c8cacd] hover:text-white cursor-pointer`,
  headerIcon: `text-[#8a939b] text-3xl font-black px-4 hover:text-white cursor-pointer`,
};

export default function NavbarApp() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { accounts, selected, selectedType, choose, disconnectZkLogin } = useUnifiedAccount();

  return (
    <div className={style.wrapper}>
      <Link href="/">
        <div className={style.logoContainer}>
          <div className="text-[32px] text-white font-serif">SuiTemplate</div>
          <div className={style.logoText}></div>
        </div>
      </Link>

      <div className={style.searchBar}>
        <div className={style.searchIcon}>
          <AiOutlineSearch />
        </div>
        <input
          className={style.searchInput}
          type="text"
          value={searchQuery}
          placeholder="Enter Text"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => {
            router.push(`/searching/${searchQuery}`);
          }}
          className="text-white px-2"
        >
          Search
        </button>
      </div>

      <div className={style.headerItems}>
        <Link href="/searching" />

        <div
          className={style.headerItem}
          onClick={() => {
            router.push("/explore");
          }}
        >
          Explore
        </div>

        <div
          className={style.headerIcon}
          onClick={() => {
            router.push("/nft");
          }}
        >
          <CgProfile />
        </div>
        <div className="hidden md:flex items-center gap-2 mr-2">
          {/* Unified account button - shows wallet OR zkLogin, never both */}
          {!selected ? (
            // No account connected - show both options
            <>
              <button
                onClick={() => startZkLogin('google')}
                className="rounded-md bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium"
              >
                zkLogin
              </button>
              <ConnectButton />

            </>
          ) : (
            // Account connected - show unified dropdown
            <div className="relative group">
              <button className="rounded-md bg-white text-black hover:bg-gray-100 px-4 py-2 text-sm font-medium flex items-center gap-2">
                {selected.address.slice(0, 6)}…{selected.address.slice(-4)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 bg-[#1a1b23] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {/* Current accounts */}
                  {accounts.map((a) => (
                    <button
                      key={`${a.type}-${a.address}`}
                      onClick={() => choose(a.type)}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 transition ${
                        selectedType === a.type ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">{a.label}</div>
                        {selectedType === a.type && (
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="font-mono text-sm text-white mt-1">{a.address.slice(0, 8)}…{a.address.slice(-6)}</div>
                    </button>
                  ))}
                  
                  <div className="my-2 border-t border-white/10" />
                  
                  {/* Actions */}
                  {!accounts.find(a => a.type === 'wallet') && (
                    <button
                      onClick={() => {
                        const btn = document.querySelector('[data-dapp-kit-connect-button]') as HTMLButtonElement;
                        btn?.click();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-gray-300 text-sm transition"
                    >
                      + Connect Wallet
                    </button>
                  )}
                  {!accounts.find(a => a.type === 'zklogin') && (
                    <button
                      onClick={() => startZkLogin('google')}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-gray-300 text-sm transition"
                    >
                      + Connect zkLogin
                    </button>
                  )}
                  
                  <div className="my-2 border-t border-white/10" />
                  
                  <button
                    onClick={disconnectZkLogin}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 text-sm transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
