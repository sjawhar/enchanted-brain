module.exports = {
  root: true,
  extends: "universe/native",
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  globals: {
    "WebSocket": "readonly",
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
