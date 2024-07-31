
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/api/index.ts',
    "./src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: ({ theme }) => ({
        'green': {
          DEFAULT: '#09A70B',
          100: '#0BD50F',
          200: '#0AC60E',
          300: '#0AB70D',
          400: '#09A70B'
        },
        'turing-red': '#CC1F00'
      }),
      fontFamily: {
        'barlow': ['Barlow', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'urbanist': ['Urbanist', 'sans-serif']
      }
    }
  },
  plugins: [],
}