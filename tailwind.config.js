/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#111827',
          surface: '#1f2937',
          primary: '#10b981', // Neon Green
          secondary: '#8b5cf6', // Epic Purple
          accent: '#fbbf24', // Legendary Gold
          danger: '#ef4444', // Red
          text: '#f3f4f6', 
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'neon-purple': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
