/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#121214',
        surfaceHover: '#1c1c1f',
        primary: '#4f46e5', // Indigo-600
        primaryHover: '#6366f1', // Indigo-500
        textMain: '#f3f4f6',
        textMuted: '#9ca3af',
        borderMain: '#27272a',
        danger: '#ef4444',
        warning: '#eab308',
        success: '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
