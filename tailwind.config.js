/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#f0d080',
          dark:    '#8a6e2a',
        },
        navy: {
          DEFAULT: '#071422',
          mid:     '#0d2035',
          light:   '#1a3a5c',
        },
        slate: {
          DEFAULT: '#1e4470',
          soft:    '#5a7a9a',
          muted:   '#3a5a78',
        },
        cream: '#e8d5a3',
      },
      
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'fade-in-up':  'fadeInUp 0.7s ease-out forwards',
        'scale-in':    'scaleIn 0.5s ease-out forwards',
        'slide-left':  'slideInLeft 0.7s ease-out forwards',
        'slide-right': 'slideInRight 0.7s ease-out forwards',
        'shimmer':     'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(201,168,76,0.3)' },
          to:   { boxShadow: '0 0 45px rgba(201,168,76,0.7)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #c9a84c 0%, #e8c96a 100%)',
        'navy-gradient':  'radial-gradient(ellipse at 25% 60%, #071422 0%, #040c18 55%, #020608 100%)',
        'card-gradient':  'linear-gradient(135deg, #0d2035 0%, #071422 100%)',
      },
      boxShadow: {
        'gold':     '0 0 20px rgba(201,168,76,0.3)',
        'gold-lg':  '0 0 40px rgba(201,168,76,0.5)',
        'navy':     '0 4px 30px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
