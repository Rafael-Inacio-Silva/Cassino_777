/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          bg:             '#08091a',
          surface:        '#10132a',
          card:           '#171b35',
          border:         '#252d4e',
          gold:           '#c9952a',
          'gold-light':   '#e8b44a',
          'gold-dark':    '#9a6e18',
          muted:          '#8891b4',
          danger:         '#e53e3e',
          success:        '#38a169',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #9a6e18 0%, #e8b44a 50%, #9a6e18 100%)',
        'dark-gradient': 'linear-gradient(180deg, #10132a 0%, #08091a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
