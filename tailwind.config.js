/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5407',
          DEFAULT: '#FF5407',
          hover: '#E04703',
          dark: '#000000',
          surface: '#111111',
          light: '#F7F7F7',
          border: '#E5E7EB',
          darkBorder: '#27272A',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
