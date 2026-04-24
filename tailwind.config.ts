import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      },
    },
  },
  plugins: [],
}

export default config
