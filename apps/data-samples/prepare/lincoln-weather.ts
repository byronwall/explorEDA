// Prepares the ridgeline composition example: daily mean temperatures in
// Lincoln, Nebraska, through 2016, from the ggridges package's raw data
// (Weather Underground observations, as collected by Claus Wilke).
//
//   node --experimental-strip-types prepare/lincoln-weather.ts [--cache <dir>]
//
// One row per day with the month name and number, so a composition can
// repeat by month in calendar order and take each month's density.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/wilkelab/ggridges/master/data-raw/lincoln-weather.csv";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/datasets/lincoln-weather.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const source = readCsv(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "lincoln-weather.csv"),
    "utf8"
  )
);
const rows: Row[] = [];
for (const record of source) {
  const [year, month, day] = (record.CST ?? "").split("-").map(Number);
  if (!year || !month || !day) continue;
  const mean = Number(record["Mean Temperature [F]"]);
  if (!Number.isFinite(mean)) continue;
  rows.push({
    Date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    Month: MONTHS[month - 1]!,
    "Month number": month,
    "Mean temperature": mean,
    "Max temperature": Number(record["Max Temperature [F]"]),
    "Min temperature": Number(record["Min Temperature [F]"]),
  });
}

const written = writeCsv(
  outFile,
  [
    "Date",
    "Month",
    "Month number",
    "Mean temperature",
    "Max temperature",
    "Min temperature",
  ],
  rows
);
console.log(
  `${written.rows} days written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
