'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { ClientOnly } from './ClientOnly';

function WalletButtonInner() {
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);

  const truncateAddress = (address: string) =>
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  if (connecting) {
    return (
      <button
        disabled
        className="px-6 py-2 bg-purge-red/20 border border-purge-red/40 text-purge-red rounded font-mono text-sm cursor-wait flex items-center gap-2"
      >
        <span className="inline-block w-3 h-3 border-2 border-purge-red border-t-transparent rounded-full animate-spin" />
        CONNECTING...
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-6 py-2 bg-purge-red/10 border border-purge-red hover:bg-purge-red/20 text-purge-red rounded font-mono text-sm transition-all duration-200 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-purge-green rounded-full animate-pulse" />
          {wallet?.adapter.name === 'X1 Wallet' && (
            <span className="text-purge-cyan text-xs">[X1]</span>
          )}
          {truncateAddress(publicKey.toBase58())}
          <span className="ml-1 text-purge-red/60">▾</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-black border border-purge-red/30 rounded shadow-xl z-50">
            <div className="p-3 border-b border-purge-red/20">
              <p className="text-purge-red/60 text-xs font-mono mb-1">CONNECTED WALLET</p>
              <p className="text-purge-cyan text-xs font-mono break-all">
                {publicKey.toBase58()}
              </p>
            </div>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full p-3 text-left text-purge-red hover:bg-purge-red/10 font-mono text-sm transition-colors"
            >
              ⏻ DISCONNECT
            </button>
          </div>
        )}

        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="px-6 py-2 bg-transparent border border-purge-red text-purge-red hover:bg-purge-red hover:text-black rounded font-mono text-sm transition-all duration-200 tracking-widest"
    >
      CONNECT WALLET
    </button>
  );
}

export function WalletButton() {
  return (
    <ClientOnly
      fallback={
        <button
          disabled
          className="px-6 py-2 bg-transparent border border-purge-red/30 text-purge-red/30 rounded font-mono text-sm tracking-widest cursor-wait"
        >
          CONNECT WALLET
        </button>
      }
    >
      <WalletButtonInner />
    </ClientOnly>
  );
}
