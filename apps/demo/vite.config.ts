import { copyFile } from "node:fs/promises";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
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

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    ...(command === "serve" && useLibrarySource ? [exploredaSource()] : []),
    react(),
    tailwindcss(),
    spaFallback(),
  ],
  base: "/",

  resolve: {
    alias: sourceAlias,
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
