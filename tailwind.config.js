/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',
          600: '#b8860b',
          700: '#92660a',
          800: '#78500a',
          900: '#5c3d08',
        },
        dark: {
          50:  '#1a1a2e',
          100: '#16213e',
          200: '#0f3460',
          300: '#0d1b2a',
          400: '#0a0a0f',
          500: '#060608',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4a017 0%, #fcd34d 50%, #b8860b 100%)',
        'dark-gradient': 'linear-gradient(180deg, #060608 0%, #0d1b2a 100%)',
      },
    },
  },
  plugins: [],
}
