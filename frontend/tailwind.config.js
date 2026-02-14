/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F7F8FF',
        panel: 'rgba(255, 255, 255, 0.85)',
        accent: {
          primary: '#3B82F6',
          secondary: '#F97316',
          pink: '#EC4899',
        },
        text: {
          primary: '#0F172A',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Sora"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grad-main': 'linear-gradient(135deg, #FF80BF, #A855FF, #3B82F6)',
        'grad-soft': 'linear-gradient(135deg, #FDE68A, #A5B4FC)',
      }
    },
  },
  plugins: [],
}
