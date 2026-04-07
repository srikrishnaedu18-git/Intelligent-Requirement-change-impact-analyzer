/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slatepanel: "#111827",
        card: "#172033",
        accent: "#1d4ed8",
        emeraldpanel: "#065f46",
        amberpanel: "#92400e",
        violetpanel: "#5b21b6"
      }
    }
  },
  plugins: []
};
