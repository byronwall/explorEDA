// Prepares the streamgraph composition example: unemployed persons by
// industry, monthly from 2000 through early 2010, from the Bureau of Labor
// Statistics series as packaged in vega-datasets.
//
//   node --experimental-strip-types prepare/unemployment-industries.ts [--cache <dir>]
//
// One row per industry and month with the count in thousands and the
// unemployment rate, so a composition can stack the counts across months.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/vega/vega-datasets/main/data/unemployment-across-industries.json";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/datasets/unemployment-industries.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Observation {
  series: string;
  year: number;
  month: number;
  count: number;
  rate: number;
}
const observations = JSON.parse(
  readFileSync(
    await cachedDownload(
      SOURCE_URL,
      cacheDir,
      "unemployment-across-industries.json"
    ),
    "utf8"
  )
) as Observation[];

const rows: Row[] = observations
  .sort(
    (a, b) =>
      a.year - b.year || a.month - b.month || a.series.localeCompare(b.series)
  )
  .map((item) => ({
    Industry: item.series,
    Month: `${item.year}-${String(item.month).padStart(2, "0")}-01`,
    Year: item.year,
    "Unemployed (thousands)": item.count,
    "Unemployment rate": item.rate,
  }));

const written = writeCsv(
  outFile,
  ["Industry", "Month", "Year", "Unemployed (thousands)", "Unemployment rate"],
  rows
);
console.log(
  `${written.rows} rows written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
