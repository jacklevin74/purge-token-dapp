import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    // Set root to this project to avoid workspace lockfile detection warnings
    root: path.resolve(__dirname),
    resolveAlias: {
      // Node.js built-in polyfills for browser (Solana wallet adapters need these)
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      http: 'stream-http',
      https: 'https-browserify',
      assert: 'assert',
      os: 'os-browserify/browser',
      path: 'path-browserify',
      buffer: 'buffer',
      url: 'url',
    },
  },
};

export default nextConfig;
