import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07080a",
        panel: "#0d0f12",
        line: "#20242b",
        lime: "#c7f36b",
        muted: "#8b919d",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 50px rgba(199, 243, 107, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
