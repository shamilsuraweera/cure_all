/** @type {import('tailwindcss').Config} */
const teal = {
  50: "#f0fdfa",
  100: "#ccfbf1",
  200: "#99f6e4",
  300: "#5eead4",
  400: "#2dd4bf",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
  800: "#115e59",
  900: "#134e4a",
};

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: teal,
        coral: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        // Legacy token names, remapped onto the new palette.
        ink: "#0f3d3e",
        mist: "#f0fdfa",
        ember: "#fb7185",
        tide: "#0d9488",
        moss: "#16a34a",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Work Sans", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 10px 40px rgba(13, 148, 136, 0.16)",
        soft: "0 2px 12px rgba(15, 61, 62, 0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out both",
      },
    },
  },
  plugins: [],
};
