/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        custom: '0 0 64px -50px #0006',
      },
      colors: {
        primary: {
          900: '#010440',  // Color base Azul Profundo
          800: '#1a1d53',
          700: '#343666',
          600: '#4d4f79',
          500: '#67688c',
          400: '#80819f',
          300: '#999bb3',
          200: '#b3b4c6',
          100: '#cccdd9',
        },
        secondary: {
          900: '#0009b8',  
          800: '#1a21bf',
          700: '#333ac6',
          600: '#4d53cd',
          500: '#666bd4',
          400: '#5aa3d9',
          300: '#4fd8df', // Color base Celeste Vibrante
          200: '#a7ebef',
          100: '#caf3f5',
        },
        accent: {
          900: '#ecd6af',  
          800: '#eedbb7',
          700: '#f0debf',
          600: '#f2e3c7',
          500: '#f4e6cf',
          400: '#f5ead6',
          300: '#f7efdf',
          200: '#faf3e7',
          100: '#fbf7ef',
        },
      }
    },
  },
  plugins: [],
}