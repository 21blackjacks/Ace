import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ace: {
          bg: "#050B1E",
          panel: "#08122A",
          card: "rgba(15, 27, 55, 0.78)",
          strong: "#101B38",
          text: "#F7F8FF",
          secondary: "#B9C3DA",
          muted: "#72809A",
          blue: "#2F80FF",
          cyan: "#20D6D2",
          purple: "#8B5CF6",
          pink: "#D85DF6",
          success: "#61D394",
          warning: "#F5B84B",
          danger: "#FF6B6B"
        }
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        "ace-glow": "0 18px 60px rgba(47, 128, 255, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
