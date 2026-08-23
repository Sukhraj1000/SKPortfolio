import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: [
      "src/components/game/GameExperience.tsx",
      "src/components/game/GameRoute.tsx",
      "src/components/navigation/GameNavbar.tsx",
    ],
    // These hydration and Phaser lifecycle effects intentionally synchronize
    // browser-only storage/runtime state after the static server render.
    rules: {
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
