/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm Indigo & Lavender Palette
        lavender: {
          50: '#fbfaff',
          100: '#f5f3ff',
          200: '#ede9fe',
          300: '#ddd6fe',
          400: '#c4b5fd',
          500: '#a78bfa',
        },
        slate: {
          850: '#151e2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
