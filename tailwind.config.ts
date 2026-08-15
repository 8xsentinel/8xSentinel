import type { Config } from "tailwindcss";

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

        // ── 8xSentinel BGMI Store-inspired palette ──────────────────
        'bg-void':    '#080a0f',
        'bg-surface': '#111520',
        'bg-elevated':'#131722',

        'gold':       '#ffd700',
        'gold-dim':   'rgba(255, 215, 0, 0.08)',
        'orange':     '#ff6b35',
        'orange-dim': 'rgba(255, 107, 53, 0.08)',

        'text-primary':   '#eaeaea',
        'text-secondary': '#8b949e',
        'text-muted':     '#5c6370',

        'border-gold':   'rgba(255, 255, 255, 0.08)',
        'border-subtle': 'rgba(255, 255, 255, 0.05)',

        'accent-cyan':   '#06b6d4',
        'accent-blue':   '#3b82f6',
        'accent-purple': '#8b5cf6',
        'accent-pink':   '#ec4899',
        'accent-red':    '#ef4444',
        'accent-amber':  '#f59e0b',
        'accent-green':  '#22c55e',
        'accent-tg':     '#229ed9',
      },

      fontFamily: {
        h:       ['var(--font-h)', 'Outfit', 'sans-serif'],
        b:       ['var(--font-b)', 'Inter', 'sans-serif'],
        display: ['var(--font-h)', 'Outfit', 'sans-serif'],
        body:    ['var(--font-b)', 'Inter', 'sans-serif'],
        sans:    ['var(--font-b)', 'Inter', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      backgroundImage: {
        'gradient-cyan':   'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'gradient-gold':   'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'gradient-red':    'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
        'gradient-card':   'linear-gradient(180deg, rgba(17, 21, 32, 0.75) 0%, rgba(8, 10, 15, 0.98) 100%)',
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
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
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
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },

      boxShadow: {
        'glow-cyan':   '0 0 25px rgba(6, 182, 212, 0.25)',
        'glow-gold':   '0 0 25px rgba(255, 215, 0, 0.2)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.25)',
        'glow-red':    '0 0 25px rgba(239, 68, 68, 0.25)',
        'glow-green':  '0 0 25px rgba(34, 197, 94, 0.25)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
