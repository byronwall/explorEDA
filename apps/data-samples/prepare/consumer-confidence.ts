// Prepares the small-multiples composition example: OECD consumer confidence
// indices for nine countries, July 2018 to October 2022, as published in the
// R Graph Gallery's recreation of the Economist-style grid.
//
//   node --experimental-strip-types prepare/consumer-confidence.ts [--cache <dir>]
//
// The source is one wide table with a month column and one column per
// country. This writes it long: one row per country and month, dropping
// the months a country has no value (China ends in September 2022).

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/holtzy/R-graph-gallery/master/DATA/dataConsumerConfidence.csv";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/datasets/consumer-confidence.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const wide = readCsv(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "dataConsumerConfidence.csv"),
    "utf8"
  )
);
const countries = Object.keys(wide[0]!).filter((key) => key !== "Time");
const rows: Row[] = [];
for (const record of wide) {
  const [monthName, year] = (record.Time ?? "").split("-");
  const month = MONTHS[monthName ?? ""];
  if (!month || !year) throw new Error(`Unexpected month ${record.Time}`);
  for (const country of countries) {
    const value = Number(record[country]);
    if (!record[country] || !Number.isFinite(value)) continue;
    rows.push({
      Country: country,
      Month: `${year}-${month}-01`,
      Index: Math.round(value * 100) / 100,
    });
  }
}

const written = writeCsv(outFile, ["Country", "Month", "Index"], rows);
console.log(
  `${written.rows} country-months for ${countries.length} countries written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
