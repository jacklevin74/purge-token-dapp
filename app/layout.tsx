import type { Metadata } from 'next';
import { Space_Mono, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Header } from '@/components/Header';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech',
});

export const metadata: Metadata = {
  title: 'PURGE | X1 Token',
  description: 'PURGE token interface on X1 blockchain. Mint, inspect, and manage PURGE tokens.',
  keywords: ['PURGE', 'X1', 'token', 'mint', 'crypto', 'blockchain'],
  openGraph: {
    title: 'PURGE | X1 Token',
    description: 'PURGE token interface on X1 blockchain',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${shareTechMono.variable}`}>
      <body className="bg-black text-white antialiased">
        <SolanaWalletProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-purge-red/10 py-6 text-center">
              <p className="text-purge-red/20 font-mono text-xs tracking-widest">
                PURGE TOKEN — X1 MAINNET — {new Date().getFullYear()}
              </p>
            </footer>
          </div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
