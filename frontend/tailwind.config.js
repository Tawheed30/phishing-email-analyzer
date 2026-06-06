/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        cyber: {
          bg: "#0a0e17",
          surface: "#111827",
          border: "#1f2937",
          cyan: "#00d4ff",
          red: "#ff3b5c",
          amber: "#ffb800",
          green: "#00ff88",
          purple: "#a855f7",
          orange: "#f97316",
          yellow: "#eab308",
          muted: "#64748b",
          text: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
