const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");
const { parseColor } = require("tailwindcss/lib/util/color");

/** Converts HEX color to RGB */
const toRGB = (value) => parseColor(value).color.join(" ");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  safelist: [
    {
      pattern: /animate-delay-.+/,
    },
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        pending: "rgb(var(--color-pending) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        light: "rgb(var(--color-light) / <alpha-value>)",
        dark: "rgb(var(--color-dark) / <alpha-value>)",
        darkmode: {
          50: "rgb(var(--color-darkmode-50) / <alpha-value>)",
          100: "rgb(var(--color-darkmode-100) / <alpha-value>)",
          200: "rgb(var(--color-darkmode-200) / <alpha-value>)",
          300: "rgb(var(--color-darkmode-300) / <alpha-value>)",
          400: "rgb(var(--color-darkmode-400) / <alpha-value>)",
          500: "rgb(var(--color-darkmode-500) / <alpha-value>)",
          600: "rgb(var(--color-darkmode-600) / <alpha-value>)",
          700: "rgb(var(--color-darkmode-700) / <alpha-value>)",
          800: "rgb(var(--color-darkmode-800) / <alpha-value>)",
          900: "rgb(var(--color-darkmode-900) / <alpha-value>)",
        },
      },

      fontFamily: {
        roboto: ["Roboto"],
      },

      container: {
        center: true,
      },

      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },

      strokeWidth: {
        0.5: 0.5,
        1.5: 1.5,
        2.5: 2.5,
      },

      keyframes: {
        // Side & simple menu
        "intro-divider": {
          "100%": { opacity: 1 },
        },
        "intro-menu": {
          "100%": { opacity: 1, transform: "translateX(0px)" },
        },

        // Top menu
        "intro-top-menu": {
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    plugin(function ({ addBase, matchUtilities }) {
      // Add base styles
      addBase({
        // Default colors
        ":root": {
          "--color-primary": toRGB(colors.emerald["900"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.emerald["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.yellow["400"]),
          "--color-pending": toRGB(colors.amber["500"]),
          "--color-danger": toRGB(colors.rose["600"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
        },
        // Dark-mode colors
        ".dark": {
          "--color-primary": toRGB(colors.emerald["800"]),
          "--color-darkmode-50": "87 103 132",
          "--color-darkmode-100": "74 90 121",
          "--color-darkmode-200": "65 81 114",
          "--color-darkmode-300": "53 69 103",
          "--color-darkmode-400": "48 61 93",
          "--color-darkmode-500": "41 53 82",
          "--color-darkmode-600": "40 51 78",
          "--color-darkmode-700": "35 45 69",
          "--color-darkmode-800": "27 37 59",
          "--color-darkmode-900": "15 23 42",
        },
      });

      // Add animation delay utilities
      matchUtilities(
        {
          "animate-delay": (value) => ({ "animation-delay": value }),
        },
        {
          values: Object.fromEntries(
            Array.from({ length: 50 }, (_, i) => [(i + 1) * 10, `${(i + 1) * 0.1}s`])
          ),
        }
      );

      // Add animation fill mode utilities
      matchUtilities(
        {
          "animate-fill-mode": (value) => ({ "animation-fill-mode": value }),
        },
        {
          values: {
            none: "none",
            forwards: "forwards",
            backwards: "backwards",
            both: "both",
          },
        }
      );
    }),
  ],

  variants: {
    extend: {
    },
  },
};
