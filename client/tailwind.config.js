/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        gold: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#ffe55c',
          400: '#ffd700', // True Pure Gold #ffd700
          DEFAULT: '#ffd700',
          500: '#ffd700', // Pure Gold #ffd700
          600: '#d4af37', // Metallic Luxury Gold
          700: '#a68500', // Deep Rich Gold
          800: '#786000', // Dark Gold for high contrast text
          900: '#524100', // Deepest Gold text
          950: '#382c00',
        },
        amber: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#ffe55c',
          400: '#ffd700', // True Pure Gold #ffd700
          DEFAULT: '#ffd700',
          500: '#ffd700', // Pure Gold #ffd700 (replaces default orange)
          600: '#d4af37', // Metallic Luxury Gold (replaces dark orange)
          700: '#a68500', // Deep Rich Gold (replaces brown-orange)
          800: '#786000',
          900: '#524100',
          950: '#382c00',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
