import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary: Olive Green ──────────────────────────────────────────
        // Earthy, authoritative, nature-rooted
        olive: {
          25:  '#fbfcf4',
          50:  '#f5f7e8',
          100: '#eaeed2',
          200: '#d4dcaa',
          300: '#b8c478',
          400: '#9dac50',  // vibrant
          500: '#7d8f32',  // main – slightly deeper, more authoritative
          600: '#637220',
          700: '#4e5a18',
          800: '#3c4514',
          900: '#2e340f',
          950: '#1a1e07',
        },
        // ── Primary: Milk Cream ───────────────────────────────────────────
        // Warm, breathable, paper-like
        cream: {
          25:  '#fffff8',
          50:  '#fefdf0',
          100: '#fdf9e0',  // main page bg
          200: '#f9f2c0',
          300: '#f3e68e',
          400: '#ecd65a',
          500: '#e2c42a',
        },
        // ── Secondary: Orchid Green ───────────────────────────────────────
        // Brighter, fresher — used for accents, successes, highlights
        orchid: {
          50:  '#effdf4',
          100: '#d8fae5',
          200: '#b3f4cc',
          300: '#7de9a9',
          400: '#43d480',
          500: '#1aba60',  // main orchid
          600: '#129649',
          700: '#117839',
          800: '#125f2f',
          900: '#104e27',
          950: '#062b15',
        },
        // ── Neutral: Bark / Warm Tan ──────────────────────────────────────
        // For text, borders, subtle backgrounds — warm not cold
        bark: {
          50:  '#faf7f2',
          100: '#f3ede2',
          200: '#e5d9c4',
          300: '#d0bd9a',
          400: '#b89e72',
          500: '#a08555',
          600: '#856b40',
          700: '#6b5433',
          800: '#58432a',
          900: '#493825',
          950: '#271e12',
        },
        // ── Accent: Sage ─────────────────────────────────────────────────
        // Softer secondary green for backgrounds and chips
        sage: {
          50:  '#f4f7ee',
          100: '#e6edda',
          200: '#cfdcb8',
          300: '#b0c58e',
          400: '#90ad68',
          500: '#72944a',
          600: '#5a7638',
          700: '#465c2c',
          800: '#394a25',
          900: '#313f21',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────
      // DM Sans: geometric humanist — clean but warm, not corporate
      // DM Mono: paired mono for data/code
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono:    ['"DM Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      // ── Spacing extras ───────────────────────────────────────────────────
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        'sm':  '0.375rem',
        'md':  '0.5rem',
        'lg':  '0.75rem',
        'xl':  '1rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },

      // ── Shadows — warm-tinted, never cold grey ───────────────────────────
      boxShadow: {
        'xs':         '0 1px 3px 0 rgba(62,50,20,0.06)',
        'sm':         '0 2px 6px 0 rgba(62,50,20,0.08)',
        'md':         '0 4px 14px 0 rgba(62,50,20,0.10)',
        'lg':         '0 8px 28px 0 rgba(62,50,20,0.12)',
        'xl':         '0 16px 48px 0 rgba(62,50,20,0.14)',
        'card':       '0 2px 12px 0 rgba(125,143,50,0.07), 0 1px 3px 0 rgba(62,50,20,0.05)',
        'card-hover': '0 6px 24px 0 rgba(125,143,50,0.13), 0 2px 6px 0 rgba(62,50,20,0.08)',
        'olive':      '0 4px 20px 0 rgba(125,143,50,0.25)',
        'orchid':     '0 4px 20px 0 rgba(26,186,96,0.22)',
        'inset-olive': 'inset 0 1px 3px 0 rgba(125,143,50,0.12)',
        'none':       'none',
      },

      // ── Animations ───────────────────────────────────────────────────────
      animation: {
        'spin-slow':    'spin 22s linear infinite',
        'spin-medium':  'spin 12s linear infinite',
        'fade-in':      'fadeIn 0.45s ease-out both',
        'fade-in-slow': 'fadeIn 0.8s ease-out both',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up-sm':  'slideUpSm 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':     'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'orbit':        'orbit 14s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpSm: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(110px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(110px) rotate(-360deg)' },
        },
      },

      // ── Background images ────────────────────────────────────────────────
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'mesh-olive': 'radial-gradient(at 40% 20%, rgba(157,172,80,0.18) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(26,186,96,0.12) 0px, transparent 50%), radial-gradient(at 10% 70%, rgba(125,143,50,0.10) 0px, transparent 50%)',
        'mesh-cream': 'radial-gradient(at 20% 30%, rgba(249,242,192,0.6) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(253,249,224,0.8) 0px, transparent 50%)',
        'dots-olive': 'radial-gradient(circle, rgba(125,143,50,0.15) 1px, transparent 1px)',
        'grid-olive': 'linear-gradient(rgba(125,143,50,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(125,143,50,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '20px 20px',
        'grid': '40px 40px',
      },

      // ── Transitions ──────────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-sm': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
      },
    },
  },
  plugins: [],
}

export default config
