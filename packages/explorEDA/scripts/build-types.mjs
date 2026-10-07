// Builds the published .d.ts and .d.cts files.
//
// tsc emits plain declarations first, then rollup-plugin-dts bundles them per
// entry. Bundling emitted declarations is far cheaper than letting tsup's dts
// step compile the sources a second time (about 3 GB and 55 s before).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const tempDir = path.join(packageDir, "node_modules/.cache/exploreda-types");
const require = createRequire(import.meta.url);

const { entries } = JSON.parse(
  readFileSync(path.join(packageDir, "entries.json"), "utf8")
);

rmSync(tempDir, { recursive: true, force: true });
execFileSync(
  process.execPath,
  [
    require.resolve("typescript/bin/tsc"),
    "-p",
    "tsconfig.types.json",
    "--outDir",
    tempDir,
  ],
  { cwd: packageDir, stdio: "inherit" }
);

const input = Object.fromEntries(
  Object.entries(entries).map(([name, source]) => [
    name,
    path.join(
      tempDir,
      source.replace(/^src\//, "").replace(/\.tsx?$/, ".d.ts")
    ),
  ])
);

const bundle = await rollup({
  input,
  plugins: [
    {
      // The emitted declarations keep the source's "@/..." and extensionless
      // relative imports.
      name: "emitted-declarations",
      resolveId(id, importer) {
        let base;
        if (id.startsWith("@/")) base = path.join(tempDir, id.slice(2));
        else if (id.startsWith(".") && importer)
          base = path.resolve(path.dirname(importer), id);
        else return null;
        return [`${base}.d.ts`, path.join(base, "index.d.ts")].find(existsSync);
      },
    },
    dts(),
  ],
  onwarn(warning, warn) {
    // Shared chunks hold types that no entry re-exports. tsup's bundle had the
    // same shape; it just did not report it.
    if (warning.message.includes("private shared type exports")) return;
    warn(warning);
  },
  external: (id) =>
    id.endsWith(".css") ||
    (!id.startsWith(".") && !id.startsWith("@/") && !path.isAbsolute(id)),
});

for (const [extension, chunkExtension] of [
  ["d.ts", "js"],
  ["d.cts", "cjs"],
]) {
  await bundle.write({
    dir: path.join(packageDir, "dist"),
    format: "es",
    entryFileNames: `[name].${extension}`,
    chunkFileNames: (chunk) =>
      `${chunk.name.replace(/\.d$/, "")}-[hash].${extension}`,
    // Point chunk imports at the runtime file name, as tsup did.
    plugins: [
      {
        name: "runtime-chunk-specifiers",
        renderChunk: (code) =>
          code
            // Stylesheets carry no types; consumers load dist/ExplorEda.css.
            .replace(/^import '[^']+\.css';\n/gm, "")
            .replace(
              new RegExp(
                `(from '[^']+)\\.${extension.replace(".", "\\.")}'`,
                "g"
              ),
              `$1.${chunkExtension}'`
            ),
      },
    ],
  });
}
await bundle.close();
rmSync(tempDir, { recursive: true, force: true });
