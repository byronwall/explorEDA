/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  exploredaSource,
  sourceAlias,
  useLibrarySource,
} from "./exploredaSource";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [...(useLibrarySource ? [exploredaSource()] : []), react()],
  resolve: {
    alias: sourceAlias,
    dedupe: ["react", "react-dom"],
  },
  test: {
    globals: true,
    environment: "./src/test/environment.ts",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/setup.ts", "src/components/ui"],
    },
  },
});
