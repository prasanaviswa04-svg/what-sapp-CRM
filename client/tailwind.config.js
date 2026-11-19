/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C1E',
          900: '#0B132B',
          800: '#1C2541',
          700: '#2C3A5E',
          600: '#3A4D7C',
          500: '#4D6298',
          100: '#E8ECF5',
          50: '#F4F6FB',
        },
        brand: {
          teal: '#0D9488',
          emerald: '#10B981',
          lightTeal: '#F0FDFA',
          accent: '#14B8A6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
