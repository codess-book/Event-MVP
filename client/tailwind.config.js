/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14070a",
        surface: "#1e0d12",
        border: "#3a1f26",
        gold: {
          DEFAULT: "#d4af37",
          soft: "#e8cf7a",
        },
        text: "#f5ecd9",
        muted: "#a89a86",
        danger: "#ff7b7b",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "14px",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};