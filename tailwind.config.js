/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -25px rgba(15, 23, 42, 0.28)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 35%), linear-gradient(135deg, rgba(226,232,240,0.45), transparent 55%)',
      },
    },
  },
  plugins: [],
};
