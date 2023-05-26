const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-kinfolk)", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        voices: {
          beige: "#ebebd2",
          gray: "#d9d9d9",
        },
      },
    },
  },
  plugins: [],
};
