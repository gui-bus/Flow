/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./entrypoints/**/*.{html,ts,tsx}",
    "./components/**/*.{html,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8BCE04',
          bgLight: '#F1F1F1',
          bgDark: '#161616',
        }
      }
    },
  },
  plugins: [],
}

