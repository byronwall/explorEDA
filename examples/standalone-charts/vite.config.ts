import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// Two pages: index.html registers every chart type through exploreda/chart;
// lean.html registers two types through exploreda/chart-core.
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        lean: resolve(__dirname, "lean.html"),
      },
    },
  },
});
