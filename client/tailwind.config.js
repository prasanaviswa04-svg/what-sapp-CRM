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
          50: '#fff7ed',   // Warm soft light orange/cream
          100: '#ffedd5',  // Very soft light orange tint
          200: '#fed7aa',  // Soft light orange border
          300: '#fdba74',  // Light orange accent border
          400: '#fb923c',  // Crisp light orange
          DEFAULT: '#ff9e43', // Pure Light Orange
          500: '#ff9e43',  // Pure Light Orange
          600: '#f58428',  // Vibrant light orange
          700: '#ea580c',  // Rich warm orange
          800: '#9a3412',  // High contrast dark orange text
          900: '#7c2d12',  // Deep dark orange text
          950: '#431407',  // Deepest dark orange text for maximum readability
        },
        amber: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          DEFAULT: '#ff9e43',
          500: '#ff9e43',
          600: '#f58428',
          700: '#ea580c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
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
