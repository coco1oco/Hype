// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Adjust paths if you use a /src folder or just /app
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Apple Design System Colors (from your index.css)
        system: {
          blue: "#007AFF",
          green: "#34C759",
          indigo: "#5856D6",
          orange: "#FF9500",
          pink: "#FF2D55",
          purple: "#AF52DE",
          red: "#FF3B30",
          teal: "#5AC8FA",
          yellow: "#FFCC00",
          gray6: "#F2F2F7", // Standard iOS background
        },
        // Semantic Layers
        background: {
          primary: "#FFFFFF",
          secondary: "#F8F9FA",
          tertiary: "#FFFFFF",
        },
        text: {
          primary: "#000000",
          secondary: "#3C3C43",
          tertiary: "rgba(60, 60, 67, 0.6)", // 3C3C4399
          quaternary: "rgba(60, 60, 67, 0.3)", // 3C3C434D
        },
        // Separators
        separator: {
          DEFAULT: "#C6C6C8",
          opaque: "#38383A",
        },
      },
      // Custom Apple-style shadows (NativeWind maps these to shadow props)
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0, 0, 0, 0.12)",
        "apple-md": "0 4px 12px rgba(0, 0, 0, 0.12)",
        "apple-lg": "0 12px 24px rgba(0, 0, 0, 0.16)",
        "apple-xl": "0 14px 28px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
