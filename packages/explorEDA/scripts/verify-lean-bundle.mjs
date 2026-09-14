import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const temp = mkdtempSync(join(tmpdir(), "exploreda-lean-"));
const input = join(temp, "consumer.ts");
const output = join(temp, "consumer.js");
const esbuild = join(
  resolve(realpathSync(join(root, "node_modules/tsup")), "..", "esbuild"),
  "bin/esbuild"
);

writeFileSync(
  input,
  `import { chartRegistry } from ${JSON.stringify(join(root, "dist/core.js"))};
import { barChartDefinition } from ${JSON.stringify(join(root, "dist/charts/bar.js"))};
chartRegistry.register(barChartDefinition);
console.log(chartRegistry.has("bar"));
`
);

const result = spawnSync(
  esbuild,
  [
    input,
    "--bundle",
    "--format=esm",
    "--external:react",
    `--outfile=${output}`,
  ],
  { cwd: root, encoding: "utf8" }
);

try {
  if (result.status !== 0) {
    process.stderr.write(
      result.stderr ?? result.error?.message ?? "esbuild failed\n"
    );
    process.exit(result.status ?? 1);
  }

  const bundle = readFileSync(output, "utf8");
  if (/@tiptap|from\s*["']three["']/.test(bundle)) {
    throw new Error("lean bundle includes Tiptap or Three.js");
  }
  if (!bundle.includes("bar")) {
    throw new Error("lean bundle does not include the selected bar chart");
  }
  console.log(
    `lean consumer bundle: ${bundle.length} bytes (${gzipSync(bundle).length} bytes gzip)`
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
