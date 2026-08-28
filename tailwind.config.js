/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bcs: {
          navy: "#0A1B2E",
          "navy-700": "#0E2740",
          "navy-600": "#123457",
          blue: "#0D5AA7",
          "blue-600": "#1668B3",
          "blue-400": "#3B82F6",
          red: "#D81E28",
          "red-400": "#F26A6A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.5rem",
      },
    },
  },
  plugins: [],
};
