/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        palette: {
          light: '#8b7c62',
          primary: '#453116',
          dark: '#0b0a07',
        },
      },
      fontFamily: {
        primary: ['Poppins'],
        secondary: ['"Open Sans"'],
      },
    },
  },
  plugins: [],
}

module.exports = config
