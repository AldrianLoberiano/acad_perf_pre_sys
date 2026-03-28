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
          light: "var(--ink-light)"
        },
        paper: "var(--paper)",
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
        border: "var(--border)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)"
        }
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        nav: "0 1px 2px rgba(0,0,0,0.04)"
      },
      borderRadius: {
        "2xl": "16px",
        "xl": "12px",
        "lg": "10px"
      }
    }
  },
  plugins: []
};

export default config;
