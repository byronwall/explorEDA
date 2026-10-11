// Prepares the compound-frame composition example: weekly seven-day average
// new Covid cases per 100,000 for six states and the whole United States,
// from The New York Times' rolling averages.
//
//   node --experimental-strip-types prepare/covid-compare.ts [--cache <dir>]
//
// Every seventh day from March 2020 through the series' end. The national
// series carries the code US so a composition can draw it beside every
// state as a comparison while leaving it out of the repeats.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const STATES_URL =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/rolling-averages/us-states.csv";
const US_URL =
  "https://raw.githubusercontent.com/nytimes/covid-19-data/master/rolling-averages/us.csv";
const FIRST_DAY = "2020-03-02";
const STATES: Record<string, string> = {
  California: "CA",
  Florida: "FL",
  "New York": "NY",
  Texas: "TX",
  Vermont: "VT",
  Washington: "WA",
};

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/covid-compare.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const first = Date.parse(`${FIRST_DAY}T00:00:00Z`);
const weekly = (date: string) => {
  const days = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - first) / 86_400_000
  );
  return days >= 0 && days % 7 === 0;
};

const rows: Row[] = [];
const states = readCsv(
  readFileSync(
    await cachedDownload(STATES_URL, cacheDir, "nyt-us-states-rolling.csv"),
    "utf8"
  )
);
for (const record of states) {
  const code = STATES[record.state ?? ""];
  if (!code || !weekly(record.date ?? "")) continue;
  rows.push({
    State: record.state ?? "",
    Code: code,
    Date: record.date ?? "",
    "Cases per 100k": Number(record.cases_avg_per_100k),
  });
}
const national = readCsv(
  readFileSync(
    await cachedDownload(US_URL, cacheDir, "nyt-us-rolling.csv"),
    "utf8"
  )
);
for (const record of national) {
  if (!weekly(record.date ?? "")) continue;
  rows.push({
    State: "United States",
    Code: "US",
    Date: record.date ?? "",
    "Cases per 100k": Number(record.cases_avg_per_100k),
  });
}
rows.sort(
  (a, b) =>
    String(a.Code).localeCompare(String(b.Code)) ||
    String(a.Date).localeCompare(String(b.Date))
);

const written = writeCsv(
  outFile,
  ["State", "Code", "Date", "Cases per 100k"],
  rows
);
console.log(
  `${written.rows} weekly rows for ${Object.keys(STATES).length} states and the US written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
