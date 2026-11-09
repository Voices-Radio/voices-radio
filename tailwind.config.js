const defaultTheme = require("tailwindcss/defaultTheme");
const { SAFE_AREA_COLOR } = require("./lib/design-tokens");

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
        gabarito: ["var(--font-gabarito)", ...defaultTheme.fontFamily.sans],
        outfit: ["var(--font-outfit)", ...defaultTheme.fontFamily.sans],
        asap: ["var(--font-asap-condensed)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "voices-display-lg": [
          "2rem",
          {
            lineHeight: "1",
            fontWeight: "900",
          },
        ],
        "voices-h1": [
          "1.5rem",
          {
            lineHeight: "1.15",
            fontWeight: "700",
          },
        ],
        "voices-h2": [
          "1.25rem",
          {
            lineHeight: "1.2",
            fontWeight: "700",
          },
        ],
        "voices-body": [
          "1rem",
          {
            lineHeight: "1.45",
          },
        ],
        "voices-meta": [
          "0.875rem",
          {
            lineHeight: "1.1",
            fontWeight: "700",
          },
        ],
        "voices-label": [
          "0.625rem",
          {
            lineHeight: "1",
            letterSpacing: "0.2em",
            fontWeight: "700",
          },
        ],
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
        voicesNext: {
          background: "#242424",
          surface: "#313131",
          cream: "#F8EFE0",
          orange: "#D34E24",
          // Same hue as `orange`, darkened to clear WCAG 2.2 AA contrast
          // (4.5:1) for white text — the brand orange only reaches 4.29:1.
          // Used for new white-on-orange buttons; existing `orange` usages
          // are left as-is rather than retrofitted site-wide.
          orangeButton: "#C24821",
          // Same hue as `orange` again, lightened this time (not darkened —
          // orangeButton goes the wrong direction for this) to clear 4.5:1
          // for *text* on both voicesNext-background and voicesNext-surface.
          // Plain `orange` measures 3.61:1 / 3.03:1 there — axe-flagged on
          // /account's active nav link and status-card labels. Scoped to
          // text; orange's use for buttons, borders and focus rings is a
          // different (3:1 non-text) threshold that isn't failing.
          orangeText: "#DF7E5F",
          live: "#DB1A1A",
          secondary: "#999999",
          white: "#FFFFFF",
          // Lightened from the original #6F6A63 (2.90:1 on background, 2.43:1
          // on surface — under the 3:1 non-text minimum for borders/UI
          // components) to clear 3:1 against both dark surfaces.
          border: "#7E796F",
          // Solid colour behind the iPhone Dynamic Island / status bar —
          // see lib/design-tokens.js for the other places this must match.
          safeArea: SAFE_AREA_COLOR,
        },
        accent: "#ed675d", // Same as voices.red for consistency
      },
      borderRadius: {
        "voices-xs": "4px",
        "voices-sm": "8px",
        "voices-md": "20px",
        "voices-lg": "40px",
      },
      spacing: {
        "voices-2": "2px",
        "voices-4": "4px",
        "voices-8": "8px",
        "voices-10": "10px",
        "voices-12": "12px",
        "voices-16": "16px",
        "voices-20": "20px",
        "voices-24": "24px",
        "voices-40": "40px",
      },
      animation: {
        "color-shift": "color-shift 4500ms ease-out 800ms infinite",
      },
      keyframes: {
        "color-shift": {
          "0%, 100%": {
            "background-color": "#000000",
          },
          "33.33%": {
            "background-color": "#5f5cf3",
          },
          "66.66%": {
            "background-color": "#ed675d",
          },
        },
      },
    },
  },
  plugins: [],
};
