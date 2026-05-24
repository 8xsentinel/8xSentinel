import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': 'var(--bg-void)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'border-subtle': 'var(--border-subtle)',
        'border-glow': 'var(--border-glow)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-cyan-dim': 'var(--accent-cyan-dim)',
        'accent-blue': 'var(--accent-blue)',
        'accent-amber': 'var(--accent-amber)',
        'accent-red': 'var(--accent-red)',
        'accent-green': 'var(--accent-green)',
        'accent-purple': 'var(--accent-purple)',
        'accent-purple-glow': 'var(--accent-purple-glow)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-cyan': 'linear-gradient(135deg, var(--accent-cyan-dim) 0%, var(--accent-cyan) 100%)',
        'gradient-blue': 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, var(--accent-purple) 100%)',
        'gradient-dark': 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-void) 100%)',
        'gradient-danger': 'linear-gradient(135deg, #b91c1c 0%, var(--accent-red) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.25)',
        'glow-amber': '0 0 20px rgba(255, 170, 0, 0.25)',
        'glow-red': '0 0 20px rgba(255, 51, 102, 0.25)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.25)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
