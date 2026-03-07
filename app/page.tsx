import { TokenInfoCard } from '@/components/TokenInfoCard';
import { MintInterface } from '@/components/MintInterface';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black bg-grid">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purge-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-purge-red/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-purge-red/40 font-mono text-xs tracking-[0.5em] uppercase">
              X1 MAINNET PROTOCOL
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black font-mono text-purge-red mb-4 tracking-widest text-glow-red animate-flicker">
            PURGE
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purge-red/40" />
            <span className="text-purge-red/60 font-mono text-sm tracking-widest">
              TOKEN INTERFACE
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purge-red/40" />
          </div>

          <p className="text-purge-red/40 font-mono text-sm max-w-xl mx-auto leading-relaxed">
            PURGE token on X1 blockchain. 18-decimal precision SPL token with mint authority controls.
            Connect your X1 Wallet or Backpack to interact.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokenInfoCard />
          <MintInterface />
        </div>

        {/* Program info strip */}
        <div className="mt-8 border border-purge-red/10 bg-black/40 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-purge-red/40 font-mono text-xs uppercase tracking-wider mb-1">
                Network
              </p>
              <p className="text-purge-cyan font-mono text-sm">X1 Mainnet</p>
            </div>
            <div>
              <p className="text-purge-red/40 font-mono text-xs uppercase tracking-wider mb-1">
                Token Standard
              </p>
              <p className="text-purge-cyan font-mono text-sm">SPL Token</p>
            </div>
            <div>
              <p className="text-purge-red/40 font-mono text-xs uppercase tracking-wider mb-1">
                Precision
              </p>
              <p className="text-purge-cyan font-mono text-sm">18 Decimals</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-mono">
          <a
            href={`https://explorer.mainnet.x1.xyz/address/${process.env.NEXT_PUBLIC_TOKEN_MINT || 'CYrMpw3kX92ZtGbLF9p7nQSYt7mj1J1WvDidtt5rpCyP'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purge-red/40 hover:text-purge-red transition-colors underline decoration-dashed"
          >
            Explorer ↗
          </a>
          <span className="text-purge-red/20">·</span>
          <a
            href="https://app.xdex.xyz/swap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purge-red/40 hover:text-purge-red transition-colors underline decoration-dashed"
          >
            xDEX Swap ↗
          </a>
          <span className="text-purge-red/20">·</span>
          <a
            href="https://chromewebstore.google.com/detail/x1-wallet/kcfmcpdmlchhbikbogddmgopmjbflnae"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purge-red/40 hover:text-purge-red transition-colors underline decoration-dashed"
          >
            X1 Wallet ↗
          </a>
        </div>
      </div>
    </div>
  );
}
