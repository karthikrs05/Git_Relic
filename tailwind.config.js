/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: '#050505',
          bgAlt: '#0a0a0a',
          primary: '#00ff9f',
          primarySoft: '#00ff88',
          white: '#e6f1ff',
          accent: '#0f3d2e',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,255,159,0.25), 0 0 20px rgba(0,255,159,0.18)',
        glowStrong: '0 0 0 1px rgba(0,255,159,0.55), 0 0 26px rgba(0,255,159,0.28)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        scan: 'scan 7s linear infinite',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(0,255,159,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
