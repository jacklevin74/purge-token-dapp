# PURGE Token dApp

> Dark cyberpunk interface for the PURGE SPL token on X1 Mainnet.

## Token Details

| Field | Value |
|-------|-------|
| Token Mint | `CYrMpw3kX92ZtGbLF9p7nQSYt7mj1J1WvDidtt5rpCyP` |
| Program ID | `8g6XCgTdm5WnQmFRZYu4DMUCJyKU1JWxKmQ16KqweP2n` |
| Mint Authority | `CQHziQSbKjuoVyEcqaDjxD2NNYcLD3fBX2vA6VD1FV4p` |
| Decimals | 18 |
| Network | X1 Mainnet |

## Features

- **Token Info Display** — live mint address, total supply, decimals, mint authority
- **Mint Interface** — mint new PURGE tokens (mint authority wallet required)
- **Wallet Support** — X1 Wallet (custom adapter), Backpack, Phantom, Solflare
- **Dark/Cyberpunk Aesthetic** — CRT scanlines, glitch effects, red-on-black theme
- **Client-Safe SSR** — proper Next.js 16 App Router + Turbopack compatibility
- **Vercel Ready** — `vercel.json` included

## Wallet Support

### X1 Wallet (Custom Adapter)
Located at `lib/adapters/X1WalletAdapter.ts`. Detects `window.x1` or `window.solana` with `isX1Wallet: true`.

Install: [Chrome Web Store](https://chromewebstore.google.com/detail/x1-wallet/kcfmcpdmlchhbikbogddmgopmjbflnae)

### Backpack
Native adapter via `@solana/wallet-adapter-backpack`.

### Phantom / Solflare
Standard Solana wallet adapters.

## Getting Started

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Start production
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_X1_RPC_URL` | `https://rpc.mainnet.x1.xyz` |
| `NEXT_PUBLIC_PROGRAM_ID` | `8g6XCgTdm5WnQmFRZYu4DMUCJyKU1JWxKmQ16KqweP2n` |
| `NEXT_PUBLIC_TOKEN_MINT` | `CYrMpw3kX92ZtGbLF9p7nQSYt7mj1J1WvDidtt5rpCyP` |
| `NEXT_PUBLIC_MINT_AUTHORITY` | `CQHziQSbKjuoVyEcqaDjxD2NNYcLD3fBX2vA6VD1FV4p` |

## Deploy to Vercel

```bash
vercel deploy
```

Or connect this repo to Vercel — it will auto-detect the Next.js framework via `vercel.json`.

Set env vars in the Vercel dashboard (optional — defaults are hardcoded).

## Project Structure

```
purge-token-dapp/
├── app/
│   ├── layout.tsx          # Root layout with wallet provider
│   ├── page.tsx            # Main page
│   └── globals.css         # Cyberpunk styles + wallet adapter overrides
├── components/
│   ├── ClientOnly.tsx      # SSR guard for wallet-dependent components
│   ├── GlitchText.tsx      # CSS glitch animation component
│   ├── Header.tsx          # Top nav with wallet button
│   ├── MintInterface.tsx   # Mint form with authority detection
│   ├── TokenInfoCard.tsx   # Live token data display
│   ├── WalletButton.tsx    # Connect/disconnect with dropdown
│   └── WalletProvider.tsx  # Client-side Solana provider setup
├── hooks/
│   ├── useMintToken.ts     # Mint transaction hook
│   └── useTokenInfo.ts     # Token data fetching hook
├── lib/
│   ├── adapters/
│   │   └── X1WalletAdapter.ts  # Custom X1 Wallet adapter
│   └── constants.ts            # Program addresses + RPC config
├── .env.example
├── next.config.ts          # Turbopack + polyfill aliases
├── tailwind.config.ts      # Cyberpunk color palette
└── vercel.json             # Vercel deployment config
```

## Mint Authority

The mint interface detects if the connected wallet matches the mint authority:
- ✅ If it matches: shows authority badge + enables mint button
- ❌ If it doesn't match: shows read-only status, mint button disabled

Only the mint authority `CQHziQSbKjuoVyEcqaDjxD2NNYcLD3fBX2vA6VD1FV4p` can mint PURGE tokens.

## Tech Stack

- **Next.js 16** with App Router + Turbopack
- **TypeScript** (ES2020 target)
- **Tailwind CSS** with custom cyberpunk palette
- **@solana/web3.js** v1
- **@solana/wallet-adapter-react** + react-ui
- **@solana/spl-token** for mint operations
