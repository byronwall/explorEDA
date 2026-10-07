import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  exploredaSource,
  sourceAlias,
  useLibrarySource,
} from "./exploredaSource";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    ...(command === "serve" && useLibrarySource ? [exploredaSource()] : []),
    react(),
    tailwindcss(),
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
