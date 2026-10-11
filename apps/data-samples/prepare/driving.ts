// Prepares the Driving composition example: annual miles driven per capita
// against the inflation-adjusted price of gas, 1956–2010, as recreated in
// vega-datasets from Hannah Fairfield's "Driving Shifts Into Reverse"
// (The New York Times, 2010).
//
//   node --experimental-strip-types prepare/driving.ts [--cache <dir>]
//
// The first run caches the source JSON in the cache folder.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/vega/vega-datasets/main/data/driving.json";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/driving.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface SourceRow {
  side: string;
  year: number;
  miles: number;
  gas: number;
}

const file = await cachedDownload(SOURCE_URL, cacheDir, "driving.json");
const source = JSON.parse(readFileSync(file, "utf8")) as SourceRow[];

// Years must be unique and contiguous so the ordered path has one vertex per year.
const years = source.map((row) => row.year).sort((a, b) => a - b);
for (let index = 1; index < years.length; index += 1) {
  if (years[index] !== years[index - 1]! + 1) {
    throw new Error(`Years are not contiguous at ${years[index]}`);
  }
}

// Shuffled on purpose: the composition's path must order rows by year, not
// by file order, and the demo proves that.
const rows: Row[] = source
  .map((row, index) => ({
    Year: row.year,
    Miles: row.miles,
    Gas: row.gas,
    "Label side": row.side,
    sort: (index * 7919) % source.length,
  }))
  .sort((a, b) => (a.sort as number) - (b.sort as number))
  .map(({ sort: _sort, ...row }) => row);

const written = writeCsv(outFile, ["Year", "Miles", "Gas", "Label side"], rows);
console.log(
  `${written.rows} years written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
