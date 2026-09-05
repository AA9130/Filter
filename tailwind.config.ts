import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Trust / water blues — the primary brand ramp
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe2fe',
          300: '#93d0fd',
          400: '#60b6fa',
          500: '#3b98f6',
          600: '#2579eb',
          700: '#1d61d8',
          800: '#1e4faf',
          900: '#1e458a',
          950: '#172b54',
        },
        // Aqua highlight — used for glows, underlines, water accents
        aqua: {
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Eco / safety green — certifications, checkmarks, WhatsApp
        eco: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Conversion orange — primary CTAs
        cta: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1da851',
        },
        ink: {
          DEFAULT: '#0b1b33',
          soft: '#3f5471',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(16 42 78 / 0.08), 0 8px 24px -8px rgb(16 42 78 / 0.10)',
        card: '0 4px 16px -6px rgb(16 42 78 / 0.12), 0 16px 40px -20px rgb(16 42 78 / 0.18)',
        lift: '0 12px 28px -8px rgb(29 97 216 / 0.28), 0 24px 60px -28px rgb(16 42 78 / 0.30)',
        glow: '0 0 0 1px rgb(255 255 255 / 0.12), 0 18px 50px -12px rgb(6 182 212 / 0.45)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgb(30 69 138 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(30 69 138 / 0.06) 1px, transparent 1px)',
        'hero-radial':
          'radial-gradient(120% 100% at 50% 0%, #1e458a 0%, #172b54 45%, #0b1b33 100%)',
      },
      backgroundSize: {
        grid: '44px 44px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 7s ease-in-out infinite',
        ripple: 'ripple 2.2s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
