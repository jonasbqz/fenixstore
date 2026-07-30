import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#f5b942",
          green: "#25d366",
          ink: "#101114",
        },
      },
      boxShadow: {
        card: "0 18px 45px rgba(10, 12, 18, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
