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

// Row, column, and postal code for each state on the tile grid.
const TILES: Record<string, [number, number, string]> = {
  Alaska: [0, 0, "AK"],
  Maine: [0, 10, "ME"],
  Vermont: [1, 9, "VT"],
  "New Hampshire": [1, 10, "NH"],
  Washington: [2, 0, "WA"],
  Idaho: [2, 1, "ID"],
  Montana: [2, 2, "MT"],
  "North Dakota": [2, 3, "ND"],
  Minnesota: [2, 4, "MN"],
  Illinois: [2, 5, "IL"],
  Wisconsin: [2, 6, "WI"],
  Michigan: [2, 7, "MI"],
  "New York": [2, 8, "NY"],
  "Rhode Island": [2, 9, "RI"],
  Massachusetts: [2, 10, "MA"],
  Oregon: [3, 0, "OR"],
  Nevada: [3, 1, "NV"],
  Wyoming: [3, 2, "WY"],
  "South Dakota": [3, 3, "SD"],
  Iowa: [3, 4, "IA"],
  Indiana: [3, 5, "IN"],
  Ohio: [3, 6, "OH"],
  Pennsylvania: [3, 7, "PA"],
  "New Jersey": [3, 8, "NJ"],
  Connecticut: [3, 9, "CT"],
  California: [4, 0, "CA"],
  Utah: [4, 1, "UT"],
  Colorado: [4, 2, "CO"],
  Nebraska: [4, 3, "NE"],
  Missouri: [4, 4, "MO"],
  Kentucky: [4, 5, "KY"],
  "West Virginia": [4, 6, "WV"],
  Virginia: [4, 7, "VA"],
  Maryland: [4, 8, "MD"],
  Delaware: [4, 9, "DE"],
  Arizona: [5, 1, "AZ"],
  "New Mexico": [5, 2, "NM"],
  Kansas: [5, 3, "KS"],
  Arkansas: [5, 4, "AR"],
  Tennessee: [5, 5, "TN"],
  "North Carolina": [5, 6, "NC"],
  "South Carolina": [5, 7, "SC"],
  "District of Columbia": [5, 8, "DC"],
  Oklahoma: [6, 3, "OK"],
  Louisiana: [6, 4, "LA"],
  Mississippi: [6, 5, "MS"],
  Alabama: [6, 6, "AL"],
  Georgia: [6, 7, "GA"],
  Hawaii: [7, 0, "HI"],
  Texas: [7, 3, "TX"],
  Florida: [7, 8, "FL"],
};

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
