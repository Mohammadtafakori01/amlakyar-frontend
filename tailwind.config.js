const brandColors = {
  primary: {
    50: '#EEF3FF',
    100: '#DCE7FF',
    200: '#B9CFFF',
    300: '#96B7FF',
    400: '#729EFF',
    500: '#4D84FF',
    600: '#1F64FF',
    700: '#0F4ED6',
    800: '#0A3BA5',
    900: '#07276F',
    950: '#04173F',
  },
  secondary: {
    50: '#F2F5FA',
    100: '#E1E7F2',
    200: '#C2CEE4',
    300: '#A2B5D5',
    400: '#839BC7',
    500: '#647FB4',
    600: '#4B6394',
    700: '#37486F',
    800: '#232F4A',
    900: '#10182A',
    950: '#080C16',
  },
  accent: {
    50: '#E0F7FF',
    100: '#B3EBFF',
    200: '#80DFFF',
    300: '#4DD2FF',
    400: '#26C6FF',
    500: '#0FB7F2',
    600: '#0499CC',
    700: '#0177A3',
    800: '#005779',
    900: '#00344A',
    950: '#001C28',
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...brandColors,
        info: brandColors.primary,
      },
      fontFamily: {
        sans: ['IranYekan', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'brand-card': '0 18px 45px rgba(15, 78, 214, 0.18)',
      },
    },
  },
  plugins: [],
  // RTL support
  corePlugins: {
    preflight: true,
  },
}
