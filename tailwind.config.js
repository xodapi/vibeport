/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep tonal ladder (5-7 levels, brass/cyan tinted)
        bg: {
          DEFAULT: '#0A0D12',
          1: '#0A0D12', // darkest
          2: '#0F131C',
          3: '#161D2B',
          4: '#1E2636',
          5: '#2A3444',
        },
        border: '#2A3444',
        accent: {
          DEFAULT: '#38BDF8', // cyan
          hover: '#0EA5E9',
        },
        success: '#6EE7B7',
        warning: '#F59E0B',
        error: '#F43F5E',
        text: {
          DEFAULT: '#E4E4E7',
          muted: '#92929E',
        },
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Fluid scale using clamp()
        'display': 'clamp(2rem, 5vw, 3.5rem)',
        'h1': 'clamp(1.75rem, 4vw, 2.5rem)',
        'h2': 'clamp(1.5rem, 3vw, 2rem)',
        'h3': 'clamp(1.25rem, 2.5vw, 1.75rem)',
        'body': 'clamp(0.875rem, 1.5vw, 1rem)',
        'small': 'clamp(0.75rem, 1.25vw, 0.875rem)',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.75',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
