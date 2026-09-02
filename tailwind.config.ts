import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1eefc",
          100: "#e7e1fb",
          200: "#cfc3f7",
          300: "#ac98ef",
          400: "#8367e0",
          500: "#5b3ee8", // indigo - cor primaria
          600: "#4a2fc4",
          700: "#3d2a97",
          800: "#2c2350",
          900: "#1a1433",
        },
        accent: {
          400: "#ff9494",
          500: "#ff6b6b", // coral - CTA e status "vencendo"
          600: "#e14f4f",
        },
        cream: "#f4f1fc",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
        disp: ["var(--font-baloo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
