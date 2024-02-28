/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {

      screens: {
        "sm": "320px",
        /* For mobiles: */
        /* your CSS here */
        "md": "481px",
        // => @media (min-width: 640px) { ... }
        "lg": "769px",
        // => @media (min-width: 1024px) { ... }

        "xl": "1025px",
        // => @media (min-width: 1280px) { ... }
        "2xl": "1201px",
        "3xl": "1501px",

      },
    extend: {
      colors: {
        'almond' :'#F2E1D9',
        'salmon' :'#FD8F5F',
        'dark-purple' :'#680F18',
        'blue-black' :'#1D2547'

      }
    },
  },
  plugins: [],
}
