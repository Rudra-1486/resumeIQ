/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic color tokens mapped to CSS custom properties (PRD Section 20.1)
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        border: {
          subtle: "var(--border-subtle)",
        },
        brand: {
          primary: "var(--brand-primary)",
        },
        status: {
          excellent: "var(--status-excellent)",
          strong: "var(--status-strong)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
        // Flat alias shortcuts for intuitive Tailwind usage
        "bg-primary": "var(--bg-primary)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-subtle": "var(--border-subtle)",
        "brand-primary": "var(--brand-primary)",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      maxWidth: {
        "7xl": "80rem", // 1280px (PRD Section 20.3)
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      },
    },
  },
  plugins: [],
}
