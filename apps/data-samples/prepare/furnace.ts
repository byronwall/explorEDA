// Prepares the furnace oxide Daily family: 168 oxide film thickness readings
// from the furnace case study in the NIST/SEMATECH e-Handbook of Statistical
// Methods (section 3.5.1), data contributed by Barry Hembree of AMD. The case
// study states the goal as 560 Angstroms +/- 100 Angstroms.
//
//   node --experimental-strip-types prepare/furnace.ts [--cache <dir>]
//
// The first run caches the source file in the cache folder.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://www.itl.nist.gov/div898/handbook/datasets/FURNACE.DAT";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/daily-viz/projects/furnace/data/furnace.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const file = await cachedDownload(SOURCE_URL, cacheDir, "FURNACE.DAT");
const lines = readFileSync(file, "utf8").split(/\r?\n/);
// The table starts after the dashed rule under the column names.
const start = lines.findIndex((line) => /^-{10,}/.test(line.trim())) + 1;
const rows: Row[] = lines
  .slice(start)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [run, zone, wafer, thickness] = line.split(/\s+/).map(Number);
    if ([run, zone, wafer, thickness].some((value) => !Number.isFinite(value)))
      throw new Error(`Unreadable line: ${line}`);
    return {
      Run: run!,
      Zone: `Zone ${zone}`,
      Wafer: wafer!,
      "Thickness (Å)": thickness!,
    };
  });
if (rows.length !== 168)
  throw new Error(`Expected 168 rows, got ${rows.length}`);

const written = writeCsv(
  outFile,
  ["Run", "Zone", "Wafer", "Thickness (Å)"],
  rows
);
console.log(
  `${written.rows} readings written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
