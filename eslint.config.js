import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^(req|res|next|_)" }],
      "no-process-exit": "error",
      "no-return-await": "error",
      "require-await": "error",
      eqeqeq: ["error", "always"],
    },
  },

  prettierConfig,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
];
