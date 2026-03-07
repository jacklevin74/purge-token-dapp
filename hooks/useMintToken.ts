'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createMintToInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID as SPL_TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID as SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import {
  PURGE_TOKEN_MINT,
  PURGE_MINT_AUTHORITY,
  PURGE_DECIMALS,
} from '@/lib/constants';

export interface MintResult {
  signature: string;
  amount: string;
}

export interface UseMintTokenReturn {
  mintTokens: (amount: string) => Promise<MintResult>;
  minting: boolean;
  error: string | null;
  success: MintResult | null;
  reset: () => void;
  hasMintAuthority: boolean;
}

export function useMintToken(): UseMintTokenReturn {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<MintResult | null>(null);

  // Check if connected wallet has mint authority
  const hasMintAuthority =
    connected && publicKey !== null && publicKey.toBase58() === PURGE_MINT_AUTHORITY.toBase58();

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const mintTokens = useCallback(
    async (amount: string): Promise<MintResult> => {
      if (!publicKey || !connected) {
        throw new Error('Wallet not connected');
      }
      if (!hasMintAuthority) {
        throw new Error('Your wallet does not have mint authority for PURGE tokens');
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      setMinting(true);
      setError(null);
      setSuccess(null);

      try {
        // Calculate raw amount with 18 decimals
        // Use BigInt to handle 18 decimal places accurately
        const wholePart = Math.floor(parsedAmount);
        const decimalStr = parsedAmount.toFixed(PURGE_DECIMALS);
        const [wholeStr, fracStr = ''] = decimalStr.split('.');
        const fracPadded = fracStr.padEnd(PURGE_DECIMALS, '0').slice(0, PURGE_DECIMALS);
        const rawAmount = BigInt(wholeStr) * BigInt(10 ** PURGE_DECIMALS) + BigInt(fracPadded);

        // Get or create the destination ATA for the minting wallet
        const destinationATA = await getAssociatedTokenAddress(
          PURGE_TOKEN_MINT,
          publicKey,
          false,
          SPL_TOKEN_PROGRAM_ID,
          SPL_ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const transaction = new Transaction();

        // Check if ATA exists; if not, add create instruction
        const ataInfo = await connection.getAccountInfo(destinationATA);
        if (!ataInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey, // payer
              destinationATA, // ata
              publicKey, // owner
              PURGE_TOKEN_MINT, // mint
              SPL_TOKEN_PROGRAM_ID,
              SPL_ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        // Add mint instruction
        transaction.add(
          createMintToInstruction(
            PURGE_TOKEN_MINT, // mint
            destinationATA, // destination
            publicKey, // authority (must be mint authority)
            rawAmount, // amount
            [], // multiSigners
            SPL_TOKEN_PROGRAM_ID
          )
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signature = await sendTransaction(transaction, connection);

        // Wait for confirmation
        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          'confirmed'
        );

        const result: MintResult = { signature, amount };
        setSuccess(result);
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Mint failed';
        setError(message);
        throw err;
      } finally {
        setMinting(false);
      }
    },
    [publicKey, connected, hasMintAuthority, connection, sendTransaction]
  );

  return { mintTokens, minting, error, success, reset, hasMintAuthority };
}
