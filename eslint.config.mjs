import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    // These React Compiler-oriented rules reject intentional client hydration
    // and imperative Phaser input/ref bridges used by this static application.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "test-results/**",
    "coverage/**",
    "assets/**",
    "public/**",
    "design-reference/**",
    "design-lab/**",
    "next-env.d.ts",
  ]),
]);
