import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          light: "var(--ink-light)",
          muted: "var(--ink-muted)"
        },
        paper: "var(--paper)",
        navy: {
          DEFAULT: "var(--navy)",
          light: "var(--navy-light)",
          muted: "var(--navy-muted)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          muted: "var(--accent-muted)"
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)"
        },
        warn: {
          DEFAULT: "var(--warn)",
          soft: "var(--warn-soft)"
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)"
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)"
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          muted: "var(--surface-muted)"
        }
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,22,40,0.04), 0 1px 2px rgba(10,22,40,0.06)",
        "card-hover": "0 8px 24px rgba(10,22,40,0.08)",
        nav: "0 1px 2px rgba(10,22,40,0.04)",
        "soft": "0 2px 8px rgba(10,22,40,0.06)",
        "navy": "0 4px 16px rgba(10,22,40,0.25)"
      },
      borderRadius: {
        "2xl": "16px",
        xl: "12px",
        lg: "10px"
      },
      fontSize: {
        "display": ["3.5rem", { lineHeight: "1", fontWeight: "800" }],
        "stat": ["2.75rem", { lineHeight: "1", fontWeight: "800" }]
      }
    }
  },
  plugins: []
};

export default config;
