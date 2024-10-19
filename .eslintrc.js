module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "next/core-web-vitals",
    "eslint-config-love",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ["**/*.ts, **/*.tsx"],
      excludedFiles: ["**/*.js"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  rules: {
    "react/no-unescaped-entities": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "@typescript-eslint/explicit-function-return-type": "error",
    "object-shorthand": ["error", "never"],
  },
};
