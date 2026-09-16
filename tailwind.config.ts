import type {Config} from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8fd',
          100: '#e3eff9',
          200: '#c1ddf2',
          300: '#8bc0e6',
          400: '#4d9dd4',
          500: '#2680bd',
          600: '#1a659f',
          700: '#175180',
          800: '#17456a',
          900: '#183a59',
          950: '#10253b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
