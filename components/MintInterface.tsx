'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useMintToken } from '@/hooks/useMintToken';
import { PURGE_MINT_AUTHORITY } from '@/lib/constants';
import { ClientOnly } from './ClientOnly';

function AuthorityBadge({ hasMintAuthority }: { hasMintAuthority: boolean }) {
  if (hasMintAuthority) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-purge-green/10 border border-purge-green/40 rounded text-xs font-mono">
        <span className="w-2 h-2 bg-purge-green rounded-full animate-pulse" />
        <span className="text-purge-green">MINT AUTHORITY DETECTED</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-purge-red/10 border border-purge-red/20 rounded text-xs font-mono">
      <span className="w-2 h-2 bg-purge-red/50 rounded-full" />
      <span className="text-purge-red/50">
        NO MINT AUTHORITY — READ ONLY ACCESS
      </span>
    </div>
  );
}

function TransactionLink({ signature }: { signature: string }) {
  const explorerUrl = `https://explorer.mainnet.x1.xyz/tx/${signature}`;
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purge-cyan hover:text-purge-cyan/70 text-xs font-mono underline decoration-dashed transition-colors"
    >
      {signature.slice(0, 16)}...{signature.slice(-8)} ↗
    </a>
  );
}

function MintInterfaceInner() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { mintTokens, minting, error, success, reset, hasMintAuthority } = useMintToken();
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateAmount = useCallback((value: string) => {
    if (!value) {
      setValidationError('');
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      setValidationError('Enter a valid number');
    } else if (num <= 0) {
      setValidationError('Amount must be greater than 0');
    } else if (num > 1_000_000_000) {
      setValidationError('Amount exceeds maximum per transaction');
    } else {
      setValidationError('');
    }
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    validateAmount(val);
    if (success || error) reset();
  };

  const handleMint = async () => {
    if (!amount || validationError) return;
    try {
      await mintTokens(amount);
    } catch {
      // error is already set in hook
    }
  };

  const handlePreset = (value: string) => {
    setAmount(value);
    validateAmount(value);
    if (success || error) reset();
  };

  const canMint =
    connected && hasMintAuthority && amount && !validationError && !minting;

  return (
    <div className="border border-purge-red/30 bg-black/60 rounded-lg p-6 backdrop-blur">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-purge-red font-mono font-bold text-lg tracking-widest mb-1">
          MINT INTERFACE
        </h2>
        <p className="text-purge-red/40 text-xs font-mono">
          Mint new $PURGE tokens to your wallet
        </p>
      </div>

      {/* Wallet / Authority Status */}
      {!connected ? (
        <div className="mb-6 p-4 border border-dashed border-purge-red/30 rounded text-center">
          <p className="text-purge-red/50 font-mono text-sm mb-3">
            Connect your wallet to interact
          </p>
          <button
            onClick={() => setVisible(true)}
            className="px-6 py-2 border border-purge-red text-purge-red hover:bg-purge-red hover:text-black font-mono text-sm rounded transition-all"
          >
            CONNECT WALLET
          </button>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <AuthorityBadge hasMintAuthority={hasMintAuthority} />
          {!hasMintAuthority && (
            <div className="text-xs font-mono text-purge-red/40 p-3 bg-black/60 border border-purge-red/10 rounded">
              <span className="text-purge-red/60">Mint authority:</span>{' '}
              <span className="text-purge-cyan/60 break-all">
                {PURGE_MINT_AUTHORITY.toBase58()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mint Form */}
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-purge-red/60 font-mono text-xs uppercase tracking-wider mb-2">
            Amount to Mint
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.000000"
              min="0"
              step="any"
              disabled={!connected || !hasMintAuthority || minting}
              className={`w-full bg-black/80 border rounded px-4 py-3 font-mono text-purge-red placeholder-purge-red/20 focus:outline-none transition-colors text-lg
                ${validationError
                  ? 'border-red-500/60 focus:border-red-500'
                  : connected && hasMintAuthority
                    ? 'border-purge-red/40 focus:border-purge-red'
                    : 'border-purge-red/20 opacity-50 cursor-not-allowed'
                }
              `}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purge-red/40 font-mono text-sm">
              PURGE
            </span>
          </div>
          {validationError && (
            <p className="mt-1 text-red-400 text-xs font-mono">⚠ {validationError}</p>
          )}
        </div>

        {/* Preset amounts */}
        {connected && hasMintAuthority && (
          <div>
            <p className="text-purge-red/40 font-mono text-xs mb-2 uppercase">Quick amounts</p>
            <div className="flex gap-2 flex-wrap">
              {['100', '1000', '10000', '1000000'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  disabled={minting}
                  className="px-3 py-1 border border-purge-red/30 hover:border-purge-red text-purge-red/60 hover:text-purge-red font-mono text-xs rounded transition-all disabled:opacity-30"
                >
                  {Number(preset).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={!canMint}
          className={`w-full py-3 font-mono text-sm tracking-widest rounded transition-all duration-200 
            ${canMint
              ? 'bg-purge-red text-black hover:bg-purge-red/80 active:scale-[0.99] shadow-[0_0_20px_rgba(220,38,38,0.3)]'
              : 'bg-purge-red/10 text-purge-red/30 cursor-not-allowed border border-purge-red/20'
            }
          `}
        >
          {minting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              MINTING...
            </span>
          ) : (
            'EXECUTE MINT'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/40 rounded">
          <p className="text-red-400 font-mono text-xs">
            ⚠ MINT FAILED
          </p>
          <p className="text-red-300/70 font-mono text-xs mt-1 break-all">
            {error}
          </p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-4 p-4 bg-purge-green/10 border border-purge-green/40 rounded">
          <p className="text-purge-green font-mono text-sm font-bold mb-2">
            ✓ MINT SUCCESSFUL
          </p>
          <p className="text-purge-green/70 font-mono text-xs mb-1">
            Minted {Number(success.amount).toLocaleString()} PURGE
          </p>
          <div className="flex items-center gap-1 text-xs font-mono text-purge-green/60 mt-2">
            <span>TX:</span>
            <TransactionLink signature={success.signature} />
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 p-3 bg-black/40 border border-purge-red/10 rounded">
        <p className="text-purge-red/30 font-mono text-xs leading-relaxed">
          ℹ Minted tokens are sent to your connected wallet&apos;s associated token account.
          Transaction requires network fees in XNT.
        </p>
      </div>
    </div>
  );
}

// Exported component with ClientOnly guard to prevent SSR wallet context errors
export function MintInterface() {
  return (
    <ClientOnly
      fallback={
        <div className="border border-purge-red/30 bg-black/60 rounded-lg p-6 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-purge-red font-mono font-bold text-lg tracking-widest mb-1">
              MINT INTERFACE
            </h2>
            <p className="text-purge-red/40 text-xs font-mono">Loading wallet...</p>
          </div>
          <div className="h-32 flex items-center justify-center">
            <span className="inline-block w-6 h-6 border-2 border-purge-red/40 border-t-purge-red rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <MintInterfaceInner />
    </ClientOnly>
  );
}
