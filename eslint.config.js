import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    languageOptions: { globals: globals.browser },
  },
  {
    languageOptions: { globals: globals.node },
    files: ["sessions/**/*"],
  },
  pluginJs.configs.recommended,
  {
    ...pluginReactConfig,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];