/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Common Thread brand colors — warm & organic
        primary: {
          50: '#fdf5f3',
          100: '#fbe8e3',
          200: '#f7d0c6',
          300: '#f0ad9a',
          400: '#e77f64',
          500: '#d95f3f',
          600: '#c24830',
          700: '#a03828',
          800: '#843026',
          900: '#6f2b24',
        },
        secondary: {
          50: '#f6f7f4',
          100: '#e9ede3',
          200: '#d4dbc8',
          300: '#b6c3a3',
          400: '#95a87b',
          500: '#7a905d',
          600: '#627449',
          700: '#4e5c3b',
          800: '#414b33',
          900: '#38402e',
        },
        accent: {
          50: '#fdf9f0',
          100: '#faf0d9',
          200: '#f4ddb2',
          300: '#ecc481',
          400: '#e3a74e',
          500: '#d9902b',
          600: '#c17623',
          700: '#a15920',
          800: '#854720',
          900: '#6e3c1e',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#e8e7e3',
          300: '#d6d4ce',
          400: '#b8b5ac',
          500: '#9a968b',
          600: '#7c7870',
          700: '#62605a',
          800: '#4a4944',
          900: '#333230',
        },
        heart: {
          low: '#c4432b',
          medium: '#e3a74e',
          high: '#7a905d',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
