/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F5F5",
        ink: "#0C0C0C",
        "ink-muted": "#1F1F1F",
        stone: "#BFBFBF",
        mint: "#59E17C",
        "mint-dark": "#2EB257",
        "mint-soft": "#DFFFD9",
        "sky-soft": "#B8D5FF",
        charcoal: "#101010",
      },
      fontFamily: {
        brand: ["\"Pixelify Sans\"", "cursive"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        brand: "0 16px 32px rgba(15, 15, 15, 0.08)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "4/5": "4 / 5",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "2rem",
        lg: "4rem",
      },
    },
  },
  plugins: [],
}