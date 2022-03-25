module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: false,
    mocha: true,
    node: true,
  },
  extends: ["prettier/@typescript-eslint", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
  },
};
