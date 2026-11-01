/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bit: {
          50: '#f0eeff',
          100: '#e0dbff',
          200: '#c4baff',
          300: '#9d8dff',
          400: '#755eff',
          500: '#635BFF',
          600: '#5243f5',
          700: '#4332d9',
          800: '#3828b7',
          900: '#2f2294',
          bg: '#f3f4f8',
          card: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};
