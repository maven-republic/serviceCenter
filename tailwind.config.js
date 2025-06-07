/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/aesthetics/**/*.{css}'
  ],
    important: false, // default is false – confirm it's not true

  corePlugins: {
    preflight: false, // ✅ disables Tailwind's base/reset layer
  },
  theme: {
    extend: {
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Menlo', 'monospace']
      },
      colors: {
        neutral: {
          50: '#f9f9f9',
          200: '#e5e5e5',
          500: '#737373',
          800: '#1f1f1f',
        },
        accent: '#5bbb7b',
        danger: '#e74c3c',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
