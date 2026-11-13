// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Couleurs principales
        'ulysse-blue': '#1359A9',
        'ulysse-gold': '#F0C75E',
        'ulysse-dark': '#0A1628',
        'ulysse-card': '#0D1F3C',
        'ulysse-border': '#1A3A6B',
        
        // Couleurs Material Design 3
        "secondary": "#eac259",
        "inverse-on-surface": "#253144",
        "surface-variant": "#2a3548",
        "on-tertiary": "#20304e",
        "surface-dim": "#071325",
        "primary": "#a9c7ff",
        "on-primary": "#003063",
        "on-tertiary-fixed-variant": "#374766",
        "on-secondary-container": "#fff3de",
        "secondary-fixed-dim": "#eac259",
        "inverse-primary": "#1c5eae",
        "secondary-container": "#8b6b00",
        "surface-container": "#142032",
        "tertiary-fixed-dim": "#b6c7ec",
        "on-secondary-fixed-variant": "#594400",
        "primary-fixed-dim": "#a9c7ff",
        "on-background": "#d7e3fc",
        "on-tertiary-container": "#c1d2f7",
        "inverse-surface": "#d7e3fc",
        "on-error": "#690005",
        "surface-container-highest": "#2a3548",
        "surface-container-low": "#101c2e",
        "on-secondary-fixed": "#251a00",
        "tertiary": "#b6c7ec",
        "background": "#071325",
        "error-container": "#93000a",
        "error": "#ffb4ab",
        "surface": "#071325",
        "tertiary-fixed": "#d7e2ff",
        "surface-tint": "#a9c7ff",
        "outline": "#8c919d",
        "on-primary-fixed-variant": "#00468b",
        "primary-container": "#1359a9",
        "surface-container-lowest": "#030e20",
        "primary-fixed": "#d6e3ff",
        "on-primary-fixed": "#001b3d",
        "on-surface": "#d7e3fc",
        "on-surface-variant": "#c2c6d3",
        "tertiary-container": "#4a5a7a",
        "surface-container-high": "#1f2a3d",
        "outline-variant": "#424751",
        "on-secondary": "#3e2e00",
        "secondary-fixed": "#ffdf95",
        "on-primary-container": "#bbd2ff",
        "on-tertiary-fixed": "#081b38",
        "on-error-container": "#ffdad6",
        "surface-bright": "#2e394d"
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "unit": "8px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        "container-max": "1280px"
      },
      fontSize: {
        "label-md": ["14px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-md": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}],
        "display-lg": ["56px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
        "headline-lg": ["40px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "headline-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}]
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
