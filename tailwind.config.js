const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./icons/**/*.{js,ts,jsx,tsx,mdx}",
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
        "mobile-kinfolk-headline": [
          "2.5rem",
          {
            lineHeight: "3.4375rem",
          },
        ],
        "inter-text": [
          "1.625rem",
          {
            lineHeight: "2.175rem",
            fontWeight: "600",
          },
        ],
        "inter-text-black": [
          "1.75rem",
          {
            fontWeight: "900",
            lineHeight: "2.125rem",
          },
        ],
        "inter-text-small": [
          "1.125rem",
          {
            fontWeight: "600",
            lineHeight: "1.375rem",
          },
        ],
        "mobile-inter-text": [
          "1.25rem",
          {
            lineHeight: "1.5rem",
            fontWeight: "600",
          },
        ],
        "mobile-inter-small": [
          "0.875rem",
          {
            lineHeight: "1rem",
            fontWeight: "600",
          },
        ],
        "mobile-inter-xsmall": [
          "0.75rem",
          {
            fontWeight: "600",
            lineHeight: "1.05rem",
          },
        ],
      },
      colors: {
        voices: {
          beige: "#ebebd2",
          gray: "#d9d9d9",
          red: "#ed675d",
          purple: "#5f5cf3",
        },
      },
    },
  },
  plugins: [],
};
