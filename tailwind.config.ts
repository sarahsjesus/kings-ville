import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { cinzel: ['var(--font-cinzel)', 'serif'], deco: ['var(--font-deco)', 'serif'] },
      colors: { gold: '#e6b84a', parchment: '#e9d6a4', ink: '#2b1a0c' },
    },
  },
  plugins: [],
} satisfies Config;
