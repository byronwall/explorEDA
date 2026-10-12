/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitestDefaults } from "@repo/test-config";
import { docsMdx } from "./mdxPlugin";
import {
  docsKitDistAlias,
  exploredaSource,
  sourceAlias,
  useLibrarySource,
} from "./exploredaSource";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ...(useLibrarySource ? [exploredaSource()] : []),
    docsMdx(),
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
  resolve: {
    alias: useLibrarySource ? sourceAlias : [...sourceAlias, docsKitDistAlias],
    dedupe: ["react", "react-dom"],
  },
  test: {
    // Shared time limits; see @repo/test-config.
    ...vitestDefaults,
    environment: "./src/test/environment.ts",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/setup.ts", "src/components/ui"],
    },
  },
});
