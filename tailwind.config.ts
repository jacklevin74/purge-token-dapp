import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'purge-red': '#dc2626',
        'purge-red-dark': '#991b1b',
        'purge-red-bright': '#ef4444',
        'purge-cyan': '#00ffaa',
        'purge-green': '#00ff88',
        'purge-dark': '#0a0a0a',
        'purge-gray': '#1a1a1a',
      },
      fontFamily: {
        mono: ['var(--font-space-mono)', 'var(--font-share-tech)', 'Courier New', 'monospace'],
      },
      animation: {
        flicker: 'flicker 6s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan': 'scanlines 8s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.96' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.94' },
          '97%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.5), 0 0 30px rgba(220, 38, 38, 0.2)',
          },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(220, 38, 38, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(220, 38, 38, 0.03) 1px, transparent 1px)
        `,
      },
    },
  },
  plugins: [],
};

export default config;
