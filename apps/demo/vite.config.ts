import { copyFile } from "node:fs/promises";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { dailyPages } from "./dailyPages.mjs";
import { docsMdx } from "./mdxPlugin";
import tailwindcss from "@tailwindcss/vite";
import {
  docsKitDistAlias,
  exploredaSource,
  sourceAlias,
  useLibrarySource,
} from "./exploredaSource";

/**
 * GitHub Pages serves 404.html for paths it has no file for. A copy of the
 * app's page there lets /viewer and /examples/<id> load directly.
 */
function spaFallback(): Plugin {
  let outDir = "dist";
  return {
    name: "spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await copyFile(
        path.join(outDir, "index.html"),
        path.join(outDir, "404.html")
      );
    },
  };
}

/**
 * `pnpm dev:agent` sets EXPLOREDA_DEV_IDLE_MINUTES so servers that agent
 * sessions leave behind exit once nothing has requested a file for that long.
 * Dozens of forgotten servers ran the machine out of memory. A plain
 * `pnpm --filter demo dev` never sets it and stays up.
 */
function idleExit(): Plugin {
  const minutes = Number(process.env.EXPLOREDA_DEV_IDLE_MINUTES);
  return {
    name: "idle-exit",
    apply: "serve",
    configureServer(server) {
      if (!(minutes > 0)) {
        return;
      }
      let lastRequest = Date.now();
      server.middlewares.use((_request, _response, next) => {
        lastRequest = Date.now();
        next();
      });
      setInterval(() => {
        if (Date.now() - lastRequest < minutes * 60_000) {
          return;
        }
        server.config.logger.info(
          `No requests for ${minutes} minute${minutes === 1 ? "" : "s"}; stopping the dev server.`
        );
        void server.close().finally(() => process.exit(0));
      }, 60_000).unref();
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    ...(command === "serve" && useLibrarySource ? [exploredaSource()] : []),
    // Docs pages are MDX; compile them before the React plugin sees them.
    docsMdx(),
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
    spaFallback(),
    dailyPages(),
    idleExit(),
  ],
  base: "/",

  resolve: {
    alias:
      command === "serve" && useLibrarySource
        ? sourceAlias
        : [...sourceAlias, docsKitDistAlias],
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react";
          }
          if (id.includes("/node_modules/three/")) {
            return "three";
          }
          if (id.includes("/node_modules/@dnd-kit/")) {
            return "dnd-kit";
          }
          if (id.includes("/node_modules/crossfilter2/")) {
            return "crossfilter";
          }
          if (id.includes("/node_modules/ohm-js/")) {
            return "ohm";
          }
          if (id.includes("/node_modules/d3-")) {
            return "d3";
          }
          if (
            id.includes("/node_modules/@tiptap/") ||
            id.includes("/node_modules/prosemirror-")
          ) {
            return "tiptap";
          }
        },
      },
    },
  },
  clearScreen: false,
}));
