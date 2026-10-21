import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50:  "#F4F4F8",
          100: "#E8E8F0",
          200: "#C8C8DC",
          400: "#8888A0",
          600: "#3A3A4E",
          700: "#2A2A38",
          750: "#222230",
          800: "#1E1E2A",
          850: "#161620",
          900: "#111118",
          950: "#0A0A0F",
        },
        accent: {
          100: "rgba(79,196,184,0.08)",
          200: "rgba(79,196,184,0.15)",
          400: "#6DCFC4",
          500: "#4FC4B8",
          600: "#3AAA9E",
        },
        success: {
          200: "rgba(76,175,125,0.15)",
          500: "#4CAF7D",
        },
        warning: {
          200: "rgba(232,160,64,0.15)",
          500: "#E8A040",
        },
        error: {
          200: "rgba(224,82,82,0.15)",
          500: "#E05252",
        },
        macro: {
          calories: "#7B8CDE",
          protein:  "#4FC4B8",
          fat:      "#E8A040",
          carbs:    "#9B6DCC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      animation: {
        "cursor-blink": "blink 1s step-end infinite",
        "step-pulse":   "stepPulse 1.5s ease-in-out infinite",
        "shimmer":      "shimmer 2s linear infinite",
        "spin-slow":    "spin 2s linear infinite",
        "fade-in":      "fadeIn 0.3s ease-out",
        "slide-up":     "slideUp 0.3s ease-out",
        "scale-in":     "scaleIn 0.2s ease-out",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        stepPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        "panel":  "0 4px 24px rgba(0,0,0,0.4)",
        "modal":  "0 16px 64px rgba(0,0,0,0.6)",
        "card":   "0 2px 12px rgba(0,0,0,0.3)",
        "glow-accent": "0 0 20px rgba(79,196,184,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
