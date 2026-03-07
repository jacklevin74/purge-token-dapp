'use client';

import { WalletButton } from './WalletButton';

export function Header() {
  return (
    <header className="border-b border-purge-red/20 bg-black/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-purge-red rounded-sm flex items-center justify-center">
              <span className="font-mono font-black text-black text-xs">P</span>
            </div>
            <div className="absolute -inset-0.5 bg-purge-red/20 rounded-sm blur-sm -z-10" />
          </div>
          <div>
            <span className="font-mono font-bold text-purge-red tracking-widest text-lg">
              PURGE
            </span>
            <span className="ml-2 text-purge-red/40 font-mono text-xs">/ X1</span>
          </div>
        </div>

        {/* Network badge + Wallet */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-purge-green/10 border border-purge-green/30 rounded">
            <span className="w-1.5 h-1.5 bg-purge-green rounded-full animate-pulse" />
            <span className="text-purge-green font-mono text-xs">X1 MAINNET</span>
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
