import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Project rules — senior defaults that support SOLID/clean code (calibrated, not type-aware
  // so the lint stays fast). `error` blocks; `warn` is visible debt — don't add new warns.
  {
    rules: {
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-console": "warn",
      "max-depth": ["warn", 4],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
  },
  // Must come last: turns off every ESLint rule that could fight Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".velite/**"]),
]);

export default eslintConfig;
