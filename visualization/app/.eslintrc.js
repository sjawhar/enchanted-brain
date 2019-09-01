module.exports = {
  root: true,
  extends: "universe/web",
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
  globals: {
    process: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
