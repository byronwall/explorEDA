/// <reference types="vitest" />
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { vitestDefaults } from "@repo/test-config";
import {
  exploredaSource,
  sourceAlias,
  useLibrarySource,
} from "./exploredaSource";

/**
 * `EXPLOREDA_FOLDER=<path> pnpm --filter app dev` serves that folder's
 * files the way the `exploreda` command does, so the app runs against a
 * real project without building the package. Open the printed link.
 */
function projectFolder(): Plugin {
  return {
    name: "exploreda-project-folder",
    apply: "serve",
    async configureServer(server) {
      const folder = process.env.EXPLOREDA_FOLDER;
      if (!folder) {
        return;
      }
      const { createRequestHandler } = await import(
        "../../packages/explorEDA/src/server/handler"
      );
      const { nodeProjectFiles } = await import(
        "../../packages/explorEDA/src/node/projectFiles"
      );
      const token = "dev";
      const handle = createRequestHandler({
        files: nodeProjectFiles(path.resolve(folder)),
        token,
        version: "dev",
      });
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next);
      });
      server.httpServer?.once("listening", () => {
        setTimeout(() => {
          const port = server.config.server.port ?? 5173;
          server.config.logger.info(
            `  Project ${path.resolve(folder)}: http://127.0.0.1:${port}/?token=${token}`
          );
        });
      });
    },
  };
}

export default defineConfig({
  // The built app is served from the package's dist/app by `exploreda`.
  base: "./",
  plugins: [
    ...(useLibrarySource ? [exploredaSource()] : []),
    projectFolder(),
    react(),
    // The library's stylesheet is Tailwind source when run from source.
    tailwindcss(),
  ],
  resolve: { alias: sourceAlias, dedupe: ["react", "react-dom"] },
  server: { host: "127.0.0.1" },
  build: {
    outDir: "../../packages/explorEDA/dist/app",
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
  test: {
    ...vitestDefaults,
    environment: "jsdom",
  },
});
