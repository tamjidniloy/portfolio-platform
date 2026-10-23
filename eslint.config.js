import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    rules: { "react/jsx-uses-vars": "error" },
  },
];
