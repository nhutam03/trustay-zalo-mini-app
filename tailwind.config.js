module.exports = {
  darkMode: ["selector", '[zaui-theme="dark"]'],
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  },
  theme: {
    extend: {
      fontFamily: {
        mono: ["Roboto Mono", "monospace"],
      },
      colors: {
        primary: "var(--zmp-primary-color)",
        secondary: "var(--zmp-secondary-color)",
        trustay: {
          green: "#0cb963",
          "green-dark": "#0a9851",
          "green-light": "#e8f8f0",
          "green-lighter": "#f0faf5",
        },
        background: "#ffffff",
        foreground: "#030213",
        muted: {
          DEFAULT: "#ececf0",
          foreground: "#717182",
        },
      },
    },
  },
};
