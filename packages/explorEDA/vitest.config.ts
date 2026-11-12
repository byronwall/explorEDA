/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitestDefaults } from "@repo/test-config";
import * as path from "path";

// Server, file, and CLI tests share temp folders, mocks, and module state, so
// each of their files still gets a fresh module graph.
const ioTests = ["src/server/**", "src/node/**", "src/cli/**"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Shared time limits and worker cap; see @repo/test-config.
    ...vitestDefaults,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/setup.ts", "src/components/ui"],
    },
    poolOptions: {
      threads: { isolate: false },
      // A VM worker is replaced once it holds this much, which keeps the
      // DOM tests near 1.2 GB in all.
      vmThreads: { memoryLimit: "256MB" },
    },
    workspace: [
      {
        // Pure logic: Node, and one module graph per worker instead of one
        // per file. Importing the library cost about 0.3 s a file, more than
        // the tests themselves. A test here must not mutate shared objects.
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ioTests,
          environment: "node",
          // Vitest reads isolation per pool, not per project, so this
          // project gets its own pool.
          pool: "threads",
        },
      },
      {
        extends: true,
        test: {
          name: "io",
          include: ioTests.map((dir) => `${dir}/*.test.ts`),
          environment: "node",
        },
      },
      {
        // Anything that needs the DOM is a .tsx test. Heavy packages are
        // bundled once, so a file doesn't load lucide-react's icons one
        // module at a time.
        extends: true,
        test: {
          name: "dom",
          include: ["src/**/*.test.tsx"],
          environment: "jsdom",
          // A fresh VM context per file instead of a fresh process: about
          // 40% less time. Globals and source modules are still fresh for
          // each file; only packages from node_modules are shared.
          pool: "vmThreads",
          deps: {
            optimizer: {
              web: {
                enabled: true,
                include: [
                  "lucide-react",
                  "@radix-ui/*",
                  "@tiptap/*",
                  "three",
                  "d3-*",
                  "@dnd-kit/*",
                  "cmdk",
                  "react-grid-layout",
                  "react-resizable",
                  "markdown-it",
                  "ohm-js",
                  "sonner",
                  "react-colorful",
                ],
              },
            },
          },
          setupFiles: ["./src/test/setup.ts"],
        },
      },
    ],
  },
});
