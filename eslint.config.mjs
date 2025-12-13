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
      // Enable helpful TypeScript rules
      // "@typescript-eslint/no-explicit-any": "off",  // Consider enabling for better type safety
      // "@typescript-eslint/no-unused-vars": "off",  // Consider enabling to catch unused variables
      
      // React 相关规则
      // "react-hooks/exhaustive-deps": "off",  // Consider enabling for better hook dependencies
      
      // Next.js 相关规则
      // "@next/next/no-img-element": "off",  // Consider enabling for better image optimization
      
      // 一般JavaScript规则
      // "prefer-const": "off",  // Consider enabling for better variable declarations
      // "no-unused-vars": "off",  // Consider enabling to catch unused variables
      "no-console": "warn",  // Change from off to warn to remind developers to remove console logs
      "no-debugger": "warn",  // Change from off to warn to remind developers to remove debugger statements
    },
  },
];

export default eslintConfig;
