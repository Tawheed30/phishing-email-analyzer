/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        threat: {
          phishing: "#ef4444",
          suspicious: "#f97316",
          clean: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
