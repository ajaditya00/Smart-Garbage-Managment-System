/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral shades extension for fine-tuned dark/light surfaces
        neutral: {
          250: '#dcdce0',
          350: '#b5b5bc',
          450: '#85858d',
          750: '#2d2d32',
          850: '#1f1f23',
        },
        // Retain primary for compatibility, but align with brand emerald
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Aligned to Emerald-500
          600: '#059669', // Aligned to Emerald-600
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Brand / Primary (Emerald Accent)
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Semantic states
        success: {
          light: '#f0fdf4',
          border: '#bbf7d0',
          text: '#15803d',
          solid: '#10b981'
        },
        info: {
          light: '#eff6ff',
          border: '#bfdbfe',
          text: '#1d4ed8',
          solid: '#3b82f6'
        },
        warning: {
          light: '#fffbeb',
          border: '#fde68a',
          text: '#b45309',
          solid: '#f59e0b'
        },
        danger: {
          light: '#fff5f5',
          border: '#fee2e2',
          text: '#b91c1c',
          solid: '#ef4444'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};