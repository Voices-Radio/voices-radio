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
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        kinfolk: ["var(--font-kinfolk)", ...defaultTheme.fontFamily.serif],
      },
      fontSize: {
        "kinfolk-headline": [
          "4.375rem",
          {
            lineHeight: "3.4375rem",
          },
        ],
        "inter-text-semibold": [
          "1.625rem",
          {
            lineHeight: "2.175rem",
            fontWeight: "600",
          },
        ],
        "inter-text-small": [
          "1.125rem",
          {
            fontWeight: "600",
            lineHeight: "1.375rem",
          },
        ],
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
