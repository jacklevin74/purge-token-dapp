'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import {
  X1_RPC_URL,
  PURGE_TOKEN_MINT,
  PURGE_DECIMALS,
  PURGE_MINT_AUTHORITY,
} from '@/lib/constants';

export interface TokenInfo {
  mintAddress: string;
  supply: string;
  rawSupply: bigint;
  decimals: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isInitialized: boolean;
}

export interface UseTokenInfoReturn {
  tokenInfo: TokenInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTokenInfo(): UseTokenInfoReturn {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(X1_RPC_URL, 'confirmed');
      const mintInfo = await getMint(connection, PURGE_TOKEN_MINT);

      const rawSupply = mintInfo.supply;
      // Format supply with 18 decimals
      const supplyBigInt = rawSupply;
      const divisor = BigInt(10 ** PURGE_DECIMALS);
      const whole = supplyBigInt / divisor;
      const fraction = supplyBigInt % divisor;
      const formattedSupply = fraction > 0n
        ? `${whole.toLocaleString()}.${fraction.toString().padStart(PURGE_DECIMALS, '0').replace(/0+$/, '')}`
        : whole.toLocaleString();

      setTokenInfo({
        mintAddress: PURGE_TOKEN_MINT.toBase58(),
        supply: formattedSupply,
        rawSupply,
        decimals: mintInfo.decimals,
        mintAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
        freezeAuthority: mintInfo.freezeAuthority?.toBase58() ?? null,
        isInitialized: mintInfo.isInitialized,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch token info';
      console.error('useTokenInfo error:', err);
      // Provide fallback info even on error
      setTokenInfo({
        mintAddress: PURGE_TOKEN_MINT.toBase58(),
        supply: 'Error loading',
        rawSupply: 0n,
        decimals: PURGE_DECIMALS,
        mintAuthority: PURGE_MINT_AUTHORITY.toBase58(),
        freezeAuthority: null,
        isInitialized: true,
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenInfo();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokenInfo, 30_000);
    return () => clearInterval(interval);
  }, [fetchTokenInfo]);

  return { tokenInfo, loading, error, refetch: fetchTokenInfo };
}
