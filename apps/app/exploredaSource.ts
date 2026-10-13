import { readFileSync } from "fs";
import path from "path";
import { normalizePath, type Alias, type Plugin } from "vite";

const appSrc = path.resolve(__dirname, "./src");
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
      // Module IDs use forward slashes on every platform, Windows included.
      if (
        !id.startsWith(normalizePath(path.join(librarySrc, "lib/analysis/")))
      ) {
        return null;
      }
      return code.replace('"./analysis-worker.js"', '"./analysisWorker.ts"');
    },
  };
}

// Both the app and the library use "@/" for their own src folder.
export const sourceAlias: Alias[] = [
  {
    find: /^@\/(.*)$/,
    replacement: "$1",
    customResolver(source, importer) {
      const root = importer?.startsWith(normalizePath(librarySrc))
        ? librarySrc
        : appSrc;
      return this.resolve(path.join(root, source), importer, {
        skipSelf: true,
      });
    },
  },
];

// The docs kit is a library entry the package does not export, so the
// built package resolves it by file. From source, exploredaSource() maps it.
export const docsKitDistAlias: Alias = {
  find: /^exploreda\/docs-kit$/,
  replacement: path.join(libraryDir, "dist/docs-kit.js"),
};
