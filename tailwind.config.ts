import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      'xs': '480px',     // Extra small devices
      'sm': '640px',     // Small devices like phones
      'md': '768px',     // Medium devices like tablets
      'lg': '1024px',    // Large devices like laptops
      'xl': '1280px',    // Extra large devices like desktops
      '2xl': '1536px',   // 2X large devices like large desktops
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    fontFamily: {
      sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'monospace']
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.16' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }],
    },
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      'md': '0.375rem', // 6px for buttons
      'lg': '0.5rem',   // 8px for secondary elements
      'xl': '0.75rem',  // 12px for primary cards
      '2xl': '1rem',
      '3xl': '1.5rem',
      'full': '9999px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Text specific colors
        heading: 'hsl(var(--text-heading))',
        body: 'hsl(var(--text-body))',
        // Neutral Grays
        gray: {
          50: 'hsl(var(--gray-50))',
          100: 'hsl(var(--gray-100))',
          200: 'hsl(var(--gray-200))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      backdropBlur: {
        'none': '0',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',  // Glass Secondary (16px)
        'xl': '20px',  // Glass Primary (20px)
        '2xl': '24px', // Glass Accent (24px)
        '3xl': '32px', // Hover states
      },
      boxShadow: {
        'primary': 'var(--shadow-primary)',
        'secondary': 'var(--shadow-secondary)',
        'inset': 'var(--shadow-inset)',
        'glass': 'var(--shadow-primary), var(--shadow-inset)',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'standard': '300ms',
        'glass': '400ms',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addUtilities, theme }) {
      // Add custom glassmorphism utilities
      const newUtilities = {
        '.glass-primary': {
          'backdropFilter': `blur(${theme('backdropBlur.xl')})`,
          'backgroundColor': 'rgba(var(--glass-primary-bg), var(--glass-primary-opacity))',
          'border': '1px solid rgba(255,255,255,0.15)',
          'boxShadow': 'var(--shadow-primary), var(--shadow-inset)',
          'transition': 'backdrop-filter var(--transition-glass), background-color var(--transition-glass)',
        },
        '.glass-primary:hover': {
          'backdropFilter': `blur(${theme('backdropBlur.3xl')})`,
          'backgroundColor': 'rgba(var(--glass-primary-bg), calc(var(--glass-primary-opacity) + 0.05))',
        },
        '.glass-secondary': {
          'backdropFilter': `blur(${theme('backdropBlur.lg')})`,
          'backgroundColor': 'rgba(var(--glass-secondary-bg), var(--glass-secondary-opacity))',
          'border': '1px solid rgba(255,255,255,0.1)',
          'boxShadow': 'var(--shadow-secondary), var(--shadow-inset)',
          'transition': 'backdrop-filter var(--transition-glass), background-color var(--transition-glass)',
        },
        '.glass-secondary:hover': {
          'backdropFilter': `blur(${theme('backdropBlur.xl')})`,
          'backgroundColor': 'rgba(var(--glass-secondary-bg), calc(var(--glass-secondary-opacity) + 0.05))',
        },
        '.glass-accent': {
          'backdropFilter': `blur(${theme('backdropBlur.2xl')})`,
          'backgroundColor': 'rgba(var(--glass-accent-bg), var(--glass-accent-opacity))',
          'border': '1px solid rgba(var(--glass-accent-bg), 0.2)',
          'boxShadow': 'var(--shadow-primary), var(--shadow-inset)',
          'transition': 'backdrop-filter var(--transition-glass), background-color var(--transition-glass)',
        },
        '.glass-accent:hover': {
          'backdropFilter': `blur(${theme('backdropBlur.3xl')})`,
          'backgroundColor': 'rgba(var(--glass-accent-bg), calc(var(--glass-accent-opacity) + 0.05))',
        },
        '.glass-dark': {
          'backdropFilter': `blur(${theme('backdropBlur.xl')})`,
          'backgroundColor': 'rgba(var(--glass-dark-bg), var(--glass-dark-opacity))',
          'border': '1px solid rgba(255,255,255,0.05)',
          'boxShadow': 'var(--shadow-primary)',
          'transition': 'backdrop-filter var(--transition-glass), background-color var(--transition-glass)',
        },
        '.container-windsurf': {
          'marginLeft': 'auto',
          'marginRight': 'auto',
          'paddingLeft': '1.5rem',
          'paddingRight': '1.5rem',
          'maxWidth': 'var(--content-width)',
        },
        '.grid-windsurf': {
          'display': 'grid',
          'gridTemplateColumns': 'repeat(12, 1fr)',
          'gap': 'var(--grid-gutter)',
        },
        '.focus-ring': {
          'outline': 'none',
          '&:focus': {
            'ring': '2px',
            'ringColor': 'hsl(var(--accent))',
            'ringOffset': '2px',
          },
        },
        '.float-animation': {
          'animation': 'float 6s ease-in-out infinite',
          'willChange': 'transform',
        },
      };

      addUtilities(newUtilities);
    }),
  ],
} satisfies Config;

export type { Config };
