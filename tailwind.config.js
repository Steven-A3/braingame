/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#4a90d9',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brain: {
          memory: '#8b5cf6',
          logic: '#10b981',
          focus: '#f59e0b',
          calculation: '#3b82f6',
          language: '#ec4899',
          speed: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'flame': 'flame 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scale(1) rotate(-3deg)' },
          '100%': { transform: 'scale(1.1) rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
