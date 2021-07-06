const colors = require('tailwindcss/colors');
module.exports = {
  //mode: 'jit',

  //purge: ['./src/**/*.html'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        DEFAULT: 'rgba(103, 151, 255, 0.11) 0px 8px 60px 0px,  rgba(103, 151, 255, 0.11) 0px 12px 90px 0px;',
      },
      colors: {
        blueGray: colors.blueGray,
        blue: colors.blue,
             iron: {
   '50': '#858585',
  '100': '#787878',
  '200': '#5F5F5F',
  '300': '#454545',
  '400': '#2C2C2C',
  '500': '#121212'
},

      },
      fontFamily: {
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',] // Ensure fonts with spaces have " " surrounding it.
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}