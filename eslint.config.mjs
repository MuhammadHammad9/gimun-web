import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-admin-test/**",
    "scratch/**",
    "out/**",
    "build/**",
    "playwright-report/**",
    "test-results/**",
    "artifacts/**",
    "next-env.d.ts",
    "frontend/scripts/**",
    "backend/scripts/**",
    "shared/scripts/**",
    // Third-party agent skills (vendored tooling, not site code).
    ".claude/**",
    ".agents/**",
  ]),
  // Page changes run the curtain transition only through TransitionLink.
  // The admin keeps plain links: it has no curtain and no smooth scroll.
  {
    files: ["src/**/*.{ts,tsx}", "frontend/**/*.{ts,tsx}", "backend/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
    ignores: ["src/app/admin/**", "frontend/components/motion/TransitionLink.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "next/link",
              message: "Use TransitionLink from @frontend/components/motion/TransitionLink so page changes run the curtain.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
