import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vara: {
          dark: "#0F1923",
          navy: "#1A2744",
          blue: "#2D7FF9",
          "blue-dark": "#1A5CCC",
          slate: "#64748B",
          light: "#F0F4F8",
          success: "#4EEABC",
          warning: "#F5C542",
          danger: "#FF6B4A",
        },
      },
      fontFamily: {
        display: ["Clash Display", "Arial", "sans-serif"],
        body: ["General Sans", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
