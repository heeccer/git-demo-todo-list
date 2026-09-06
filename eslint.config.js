import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import vue from "eslint-plugin-vue";
// import tseslint from "typescript-eslint";

export default defineConfig([
  // 【全局忽略，替代 .eslintignore】必须单独对象，不要写 files
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.*",
      "coverage/**"
    ]
  },

  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended],
  },
  // {
  //   files: ["**/*.{ts,tsx}"],
  //   extends: [...tseslint.configs.recommended],
  // },
  {
    files: ["**/*.vue"],
    plugins: { vue },
    extends: [...vue.configs["flat/recommended"]],
  }
]);
