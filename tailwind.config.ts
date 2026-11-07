import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FCFAF6',
          200: '#F5F1E8',
          300: '#ECE5D6',
        },
        obsidian: {
          900: '#111111',
          800: '#1A1A1A',
          700: '#222222',
        },
        amber: {
          500: '#F97316',
          600: '#EA580C',
        },
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        bento: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'bento-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.07)',
        float: '0 8px 32px rgba(0, 0, 0, 0.06)',
      },
      letterSpacing: {
        tighter: '-0.045em',
        tight: '-0.03em',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

