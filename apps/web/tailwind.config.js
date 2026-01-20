/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f4f7ff",
        ember: "#f97316",
        tide: "#0ea5e9",
        moss: "#16a34a",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Work Sans", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 10px 40px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
};
