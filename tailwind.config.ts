import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6fb",
          100: "#d7ebf5",
          200: "#a9d2e8",
          300: "#71b3d6",
          400: "#3e8fbe",
          500: "#1e5f8c", // cobalto - cor primaria
          600: "#184c70",
          700: "#12405f",
          800: "#0f3450",
          900: "#0b2740",
        },
        accent: {
          400: "#e0855f",
          500: "#c96f4a", // terracota - acao/destaque
          600: "#a8532f",
        },
        cream: "#f7f2ea",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
