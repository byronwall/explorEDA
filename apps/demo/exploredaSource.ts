import { readFileSync } from "fs";
import path from "path";
import type { AliasOptions, Plugin } from "vite";

const demoSrc = path.resolve(__dirname, "./src");
const libraryDir = path.resolve(__dirname, "../../packages/explorEDA");
const librarySrc = path.join(libraryDir, "src");

// Runs the library from its source, so the dev server and the demo tests see
// library edits without a build. Set EXPLOREDA_DIST=1 to use the built package.
export const useLibrarySource = process.env.EXPLOREDA_DIST !== "1";

export function exploredaSource(): Plugin {
  const { entries } = JSON.parse(
    readFileSync(path.join(libraryDir, "entries.json"), "utf8")
  ) as { entries: Record<string, string> };
  return {
    name: "exploreda-source",
    enforce: "pre",
    resolveId(id) {
      if (id === "exploreda/dist/ExplorEda.css") {
        return path.join(librarySrc, "index.css");
      }
      if (id !== "exploreda" && !id.startsWith("exploreda/")) {
        return null;
      }
      const entry = entries[id === "exploreda" ? "ExplorEda" : id.slice(10)];
      return entry ? path.join(libraryDir, entry) : null;
    },
    transform(code, id) {
      // The package loads its built worker file; from source, load the
      // worker module itself.
      if (!id.startsWith(path.join(librarySrc, "lib/analysis/"))) return null;
      return code.replace('"./analysis-worker.js"', '"./analysisWorker.ts"');
    },
  };
}

// Both the demo and the library use "@/" for their own src folder.
export const sourceAlias: AliasOptions = [
  {
    find: /^@\/(.*)$/,
    replacement: "$1",
    customResolver(source, importer) {
      const root = importer?.startsWith(librarySrc) ? librarySrc : demoSrc;
      return this.resolve(path.join(root, source), importer, {
        skipSelf: true,
      });
    },
  },
];
