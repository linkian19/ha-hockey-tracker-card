import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        __VERSION__: "readonly", // injected by vite.config.js
      },
    },
  },
  {
    files: ["*.config.js", "tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
