import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // ── shadcn/ui CSS-var tokens ─────────────────────────────────
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── 8xSentinel cyber palette ───────────────────────────────
        'bg-void':    '#03050c',
        'bg-surface': '#070b16',
        'bg-elevated':'#0b1020',

        'text-primary':   '#f1f5f9',
        'text-secondary': '#7c8fa6',
        'text-muted':     '#3d4f63',

        'border-subtle': '#1a2535',

        'accent-cyan':   '#06b6d4',
        'accent-purple': '#8b5cf6',
        'accent-pink':   '#ec4899',
        'accent-red':    '#ef4444',
        'accent-amber':  '#f59e0b',
        'accent-green':  '#22c55e',
        'accent-blue':   '#3b82f6',
      },

      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      backgroundImage: {
        'gradient-cyan':   'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'gradient-red':    'linear-gradient(135deg, #ef4444, #f59e0b)',
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },

      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.4)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.4)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.4)',
        'glow-green':  '0 0 20px rgba(34,197,94,0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
