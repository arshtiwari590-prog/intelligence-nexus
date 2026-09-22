/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1f2937',
        darker: '#111827',
        border: '#374151'
      }
    },
  },
  plugins: [],
}
