/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IranYekan', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // RTL support
  corePlugins: {
    preflight: true,
  },
}
