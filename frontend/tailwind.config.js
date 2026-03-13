/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#0B1120',       // Deeper premium dark blue background
          card: '#111827',     // Slightly lighter dark blue for cards
          neon: '#3B82F6',     // Premium Blue accent (replacing neon green)
          neonHover: '#2563EB',// Darker blue for hover states
          border: '#1F2937',   // Dark border color
          text: '#F8FAFC',     // Off-white text
          muted: '#94A3B8',    // Muted slate text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'cursive'],
      },
    },
  },
  plugins: [],
};
