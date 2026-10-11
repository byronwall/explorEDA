// Prepares the tile-grid composition example: seven-day average new Covid
// cases per 100,000 people by state, from The New York Times' rolling
// averages, sampled weekly, with each state's address on a US tile grid.
//
//   node --experimental-strip-types prepare/covid-tiles.ts [--cache <dir>]
//
// Every seventh day is kept from the first Monday in March 2020 through the
// end of the series, so each state has one value a week. The tile grid is
// the common 8 × 11 layout: Alaska and Hawaii in the corners, Maine at the
// top right, and D.C. beside Maryland.

import { readFileSync } from "node:fs";
import path from "node:path";
import { US_TILES as TILES } from "./usTiles.ts";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/rolling-averages/us-states.csv";
const FIRST_DAY = "2020-03-02";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/covid-tiles.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const source = readCsv(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "nyt-us-states-rolling.csv"),
    "utf8"
  )
);
const first = Date.parse(`${FIRST_DAY}T00:00:00Z`);
const rows: Row[] = [];
let lastDate = "";
for (const record of source) {
  const tile = TILES[record.state ?? ""];
  if (!tile) continue;
  const date = record.date ?? "";
  const days = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - first) / 86_400_000
  );
  if (days < 0 || days % 7 !== 0) continue;
  rows.push({
    State: record.state ?? "",
    Code: tile[2],
    Tile: `${tile[0]},${tile[1]}`,
    Date: date,
    "Cases per 100k": Number(record.cases_avg_per_100k),
  });
  if (date > lastDate) lastDate = date;
}
rows.sort(
  (a, b) =>
    String(a.State).localeCompare(String(b.State)) ||
    String(a.Date).localeCompare(String(b.Date))
);

const written = writeCsv(
  outFile,
  ["State", "Code", "Tile", "Date", "Cases per 100k"],
  rows
);
console.log(
  `${written.rows} state-weeks for ${Object.keys(TILES).length} states through ${lastDate} written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
