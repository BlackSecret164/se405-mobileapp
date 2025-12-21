/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0a7ea4",
        background: {
          light: "#ffffff",
          dark: "#151718",
        },
      },
    },
  },
  plugins: [],
};
