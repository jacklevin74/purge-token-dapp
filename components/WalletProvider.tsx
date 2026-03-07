'use client';

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { X1_RPC_URL } from '@/lib/constants';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

/**
 * Deferred wallet provider — loads all Solana wallet adapter code on the client only.
 * This avoids SSR issues where EventEmitter / window APIs aren't available.
 */
export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  const [Provider, setProvider] = useState<FC<Props> | null>(null);

  useEffect(() => {
    // Dynamically import everything on the client
    Promise.all([
      import('@solana/wallet-adapter-react'),
      import('@solana/wallet-adapter-react-ui'),
      import('@/lib/adapters/X1WalletAdapter'),
      import('@solana/wallet-adapter-backpack'),
      import('@solana/wallet-adapter-phantom'),
      import('@solana/wallet-adapter-solflare'),
    ]).then(
      ([
        { ConnectionProvider, WalletProvider },
        { WalletModalProvider },
        { X1WalletAdapter },
        { BackpackWalletAdapter },
        { PhantomWalletAdapter },
        { SolflareWalletAdapter },
      ]) => {
        const wallets = [
          new X1WalletAdapter(),
          new BackpackWalletAdapter(),
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
        ];

        const Composed: FC<Props> = ({ children }) => (
          <ConnectionProvider endpoint={X1_RPC_URL}>
            <WalletProvider
              wallets={wallets as Parameters<typeof WalletProvider>[0]['wallets']}
              autoConnect={false}
            >
              <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        );

        Composed.displayName = 'SolanaWalletProviderInner';
        setProvider(() => Composed);
      }
    );
  }, []);

  if (!Provider) {
    // During SSR and initial hydration, render children without wallet context
    return <>{children}</>;
  }

  return <Provider>{children}</Provider>;
};
