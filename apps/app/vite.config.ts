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

/**
 * `EXPLOREDA_DATA=<path> pnpm --filter app dev` runs the team server's
 * routes with sample accounts in memory and the sample project copied into
 * that folder, so sign-in and roles can be tried without a build. Add
 * `EXPLOREDA_STORE=sqlite` to keep accounts in that folder instead, with no
 * sample accounts, as `exploreda server` does.
 */
function teamData(): Plugin {
  return {
    name: "exploreda-team-data",
    apply: "serve",
    async configureServer(server) {
      const data = process.env.EXPLOREDA_DATA;
      if (!data) {
        return;
      }
      const { memoryAccountStore } = await import(
        "../../packages/explorEDA/src/server/team/accounts"
      );
      const { seedDev } = await import(
        "../../packages/explorEDA/src/server/team/seed"
      );
      const { sqliteAccountStore } = await import(
        "../../packages/explorEDA/src/server/team/sqliteStore"
      );
      const { createTeamHandler } = await import(
        "../../packages/explorEDA/src/server/team/teamHandler"
      );
      const dataDir = path.resolve(data);
      const { mkdirSync } = await import("node:fs");
      mkdirSync(path.join(dataDir, "projects"), { recursive: true });
      let store;
      if (process.env.EXPLOREDA_STORE === "sqlite") {
        store = await sqliteAccountStore(path.join(dataDir, "exploreda.db"));
      } else {
        store = memoryAccountStore();
        await seedDev(
          store,
          dataDir,
          path.resolve(__dirname, "../../packages/explorEDA/examples/shop")
        );
      }
      // In development, `localhost` stands in for a company file server, so
      // URL downloads can be tried against a local one. The real server
      // never downloads from this machine.
      const { lookup } = await import("node:dns");
      const { guardedLookup } = await import(
        "../../packages/explorEDA/src/server/team/fileIntake"
      );
      const handle = createTeamHandler({
        store,
        dataDir,
        version: "dev",
        lookup: (hostname, options, callback) =>
          hostname === "localhost"
            ? lookup("127.0.0.1", options, callback)
            : guardedLookup(hostname, options, callback),
      });
      server.middlewares.use((req, res, next) => {
        void handle(req, res, next);
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
    teamData(),
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
