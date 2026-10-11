// Prepares the horizon chart composition example: monthly closing prices of
// five technology stocks from 2000 to 2010, as packaged in vega-datasets.
//
//   node --experimental-strip-types prepare/tech-stocks.ts [--cache <dir>]
//
// One row per company and month with an ISO date, so a composition can
// repeat by company and read each price as growth since the first month.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/vega/vega-datasets/main/data/stocks.csv";
const COMPANIES: Record<string, string> = {
  AAPL: "Apple",
  AMZN: "Amazon",
  GOOG: "Google",
  IBM: "IBM",
  MSFT: "Microsoft",
};
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/tech-stocks.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const source = readCsv(
  readFileSync(await cachedDownload(SOURCE_URL, cacheDir, "stocks.csv"), "utf8")
);
const rows: Row[] = [];
for (const record of source) {
  const match = /^([A-Z][a-z]{2}) (\d{1,2}) (\d{4})$/.exec(record.date ?? "");
  const month = match ? MONTHS.indexOf(match[1]!) + 1 : 0;
  const price = Number(record.price);
  if (!match || !month || !Number.isFinite(price)) continue;
  rows.push({
    Symbol: record.symbol!,
    Company: COMPANIES[record.symbol!] ?? record.symbol!,
    Month: `${match[3]}-${String(month).padStart(2, "0")}-01`,
    Price: price,
  });
}
rows.sort(
  (a, b) =>
    String(a.Company).localeCompare(String(b.Company)) ||
    String(a.Month).localeCompare(String(b.Month))
);

const written = writeCsv(
  outFile,
  ["Symbol", "Company", "Month", "Price"],
  rows
);
console.log(
  `${written.rows} months written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
