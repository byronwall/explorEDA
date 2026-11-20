// Prints the JavaScript each page loads before it can draw: its entry chunk
// and every chunk that entry imports statically. Run after `pnpm build`.
import { readFileSync, statSync } from "node:fs";

const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
const kb = (bytes) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

function upFront(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const next of manifest[key].imports ?? []) upFront(next, seen);
  return seen;
}

for (const [key, chunk] of Object.entries(manifest)) {
  if (!chunk.isEntry) continue;
  const files = [...upFront(key)].map((k) => manifest[k].file);
  const bytes = files.reduce(
    (sum, file) => sum + statSync(`dist/${file}`).size,
    0
  );
  const lazy = Object.values(manifest)
    .filter((c) => !files.includes(c.file) && c.file.endsWith(".js"))
    .reduce((sum, c) => sum + statSync(`dist/${c.file}`).size, 0);
  console.log(
    `${key.padEnd(12)} up front ${kb(bytes).padStart(9)}   loaded on demand ${kb(lazy)}`
  );
}
