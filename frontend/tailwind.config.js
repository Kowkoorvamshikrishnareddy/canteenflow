/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          warm: '#FAFBFC',
          pure: '#FFFFFF',
          muted: '#F3F6FA',
          subtle: '#EBF0F7',
        },
        ink: {
          primary: '#172033',
          secondary: '#687386',
          muted: '#94A3B8',
          inverted: '#FFFFFF',
        },
        brand: {
          blue: '#477DE0',
          'blue-hover': '#386AC9',
          'blue-light': '#EFF4FD',
          emerald: '#269566',
          'emerald-hover': '#1E7E55',
          'emerald-light': '#EDF8F2',
          warning: '#E5A33E',
          'warning-light': '#FEF7ED',
          error: '#D94F52',
          'error-light': '#FDF2F2',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.72)',
          'surface-elevated': 'rgba(255, 255, 255, 0.88)',
          'surface-subtle': 'rgba(250, 251, 252, 0.65)',
          border: '#E8ECF2',
          'border-translucent': 'rgba(232, 236, 242, 0.75)',
          'border-highlight': 'rgba(255, 255, 255, 0.85)',
          highlight: 'rgba(255, 255, 255, 0.6)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 8px -1px rgba(23, 32, 51, 0.04), 0 1px 3px -1px rgba(23, 32, 51, 0.02)',
        'glass-md': '0 8px 24px -4px rgba(23, 32, 51, 0.06), 0 2px 8px -2px rgba(23, 32, 51, 0.03)',
        'glass-lg': '0 20px 40px -8px rgba(23, 32, 51, 0.08), 0 4px 12px -2px rgba(23, 32, 51, 0.04)',
        'glass-floating': '0 25px 50px -12px rgba(23, 32, 51, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'brand-glow': '0 4px 16px rgba(71, 125, 224, 0.25)',
        'emerald-glow': '0 4px 16px rgba(38, 149, 102, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
