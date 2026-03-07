'use client';

import { useTokenInfo } from '@/hooks/useTokenInfo';
import { PURGE_PROGRAM_ID, PURGE_MINT_AUTHORITY } from '@/lib/constants';

function CopyButton({ text }: { text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text);
  };
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="ml-2 text-purge-red/40 hover:text-purge-red transition-colors text-xs"
    >
      ⎘
    </button>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b border-purge-red/10 last:border-0">
      <span className="text-purge-red/60 font-mono text-xs w-full sm:w-40 shrink-0 uppercase tracking-wider">
        {label}
      </span>
      <span className="flex items-center gap-1 min-w-0">
        <span className="text-purge-cyan font-mono text-xs break-all">{value}</span>
        <CopyButton text={value} />
      </span>
    </div>
  );
}

export function TokenInfoCard() {
  const { tokenInfo, loading, error, refetch } = useTokenInfo();

  return (
    <div className="border border-purge-red/30 bg-black/60 rounded-lg p-6 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purge-red/10 border border-purge-red/40 flex items-center justify-center">
            <span className="text-purge-red font-mono font-bold text-xs">PRG</span>
          </div>
          <div>
            <h2 className="text-purge-red font-mono font-bold text-lg tracking-widest">
              $PURGE
            </h2>
            <p className="text-purge-red/40 text-xs font-mono">X1 MAINNET</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          title="Refresh"
          className="text-purge-red/40 hover:text-purge-red transition-colors disabled:opacity-30 text-sm"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-purge-red/40 border-t-purge-red rounded-full animate-spin" />
          ) : (
            '↺'
          )}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-purge-red/10 border border-purge-red/30 rounded text-purge-red/70 text-xs font-mono">
          ⚠ RPC ERROR: {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purge-red/5 border border-purge-red/20 rounded p-4">
          <p className="text-purge-red/50 font-mono text-xs uppercase tracking-wider mb-1">
            Total Supply
          </p>
          {loading ? (
            <div className="h-6 bg-purge-red/10 rounded animate-pulse w-24" />
          ) : (
            <p className="text-purge-red font-mono font-bold text-lg">
              {tokenInfo?.supply ?? '—'}
            </p>
          )}
        </div>

        <div className="bg-purge-red/5 border border-purge-red/20 rounded p-4">
          <p className="text-purge-red/50 font-mono text-xs uppercase tracking-wider mb-1">
            Decimals
          </p>
          {loading ? (
            <div className="h-6 bg-purge-red/10 rounded animate-pulse w-8" />
          ) : (
            <p className="text-purge-red font-mono font-bold text-lg">
              {tokenInfo?.decimals ?? '—'}
            </p>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-0 border border-purge-red/20 rounded p-4 bg-black/40">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-purge-red/10 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <AddressRow
              label="Token Mint"
              value={tokenInfo?.mintAddress ?? PURGE_MINT_AUTHORITY.toBase58()}
            />
            <AddressRow
              label="Program ID"
              value={PURGE_PROGRAM_ID.toBase58()}
            />
            <AddressRow
              label="Mint Authority"
              value={tokenInfo?.mintAuthority ?? PURGE_MINT_AUTHORITY.toBase58()}
            />
            {tokenInfo?.freezeAuthority && (
              <AddressRow
                label="Freeze Authority"
                value={tokenInfo.freezeAuthority}
              />
            )}
          </>
        )}
      </div>

      {/* Status */}
      {!loading && tokenInfo && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tokenInfo.isInitialized ? 'bg-purge-green' : 'bg-purge-red'}`} />
          <span className="text-xs font-mono text-purge-red/50">
            {tokenInfo.isInitialized ? 'TOKEN INITIALIZED' : 'TOKEN NOT INITIALIZED'}
          </span>
        </div>
      )}
    </div>
  );
}
