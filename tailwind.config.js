/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Company Colors from AiPRL Assist Logo
        'brand-orange': '#ff8a0e',    // Orange from logo
        'brand-blue': '#05a6f4',      // Blue from logo
        
        // Background Colors
        'bg-primary': '#FFFFFF',      // White background
        'bg-secondary': '#F7F8FA',    // Light gray background
        'bg-card': '#FFFFFF',         // Card background
        
        // Text Colors
        'text-primary': '#1A1D21',    // Primary text color
        'text-secondary': '#6B7280',  // Secondary text color
        'text-muted': '#9CA3AF',      // Muted text color
        
        // Border Colors
        'border-light': '#E5E7EB',    // Light border
        'border-medium': '#D1D5DB',   // Medium border
        
        // Status Colors
        'status-success': '#10B981',  // Green for success
        'status-warning': '#F59E0B',  // Amber for warning
        'status-error': '#EF4444',    // Red for error
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'message-slide': 'messageSlide 0.4s ease-out',
        'cross-fade': 'crossFade 0.3s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        messageSlide: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        crossFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
