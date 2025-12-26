/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
        background: '#F3F4F6',
      },
    },
  },
  plugins: [],
}
