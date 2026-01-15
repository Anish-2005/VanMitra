import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow `any` across the codebase to reduce noisy linting while refactors proceed
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      // Re-enable react-hooks/exhaustive-deps. If CI still errors due to tooling
      // incompatibility, the CI workflow will run an upgraded lint environment.
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-expressions": "warn"
    }
  }
];

export default eslintConfig;
