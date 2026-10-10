// Prepares the election-strip composition example: each state's Democratic
// margin over the Republican candidate in every presidential election from
// 1976 to 2016, from the MIT Election Data and Science Lab's state returns.
//
//   node --experimental-strip-types prepare/elections.ts [--cache <dir>]
//
// The margin is the Democratic share of all votes cast minus the Republican
// share, in percentage points, so a positive value leans Democratic. Minor
// party lines are not folded in, except Minnesota's Democratic-Farmer-Labor
// line, which is the state's Democratic ticket.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://dataverse.harvard.edu/api/access/datafile/:persistentId?persistentId=doi:10.7910/DVN/42MVDX/MFU99O";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/elections.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const file = await cachedDownload(
  SOURCE_URL,
  cacheDir,
  "mit-1976-2020-president.tsv"
);
const lines = readFileSync(file, "utf8").trim().split("\n");
const header = lines[0]!.split("\t");
const unquote = (text: string) => text.replace(/^"|"$/g, "");
const records = lines.slice(1).map((line) => {
  const cells = line.split("\t").map(unquote);
  return Object.fromEntries(
    header.map((name, index) => [name, cells[index] ?? ""])
  );
});

const DEM = new Set(["democrat", "democratic-farmer-labor"]);
const REP = new Set(["republican"]);
const byStateYear = new Map<
  string,
  {
    state: string;
    code: string;
    year: number;
    total: number;
    dem: number;
    rep: number;
  }
>();
for (const record of records) {
  if (record.office !== "US President") continue;
  const key = `${record.state_po}:${record.year}`;
  const entry = byStateYear.get(key) ?? {
    state: record.state!.replace(
      /\b\w+/g,
      (word) => word[0]! + word.slice(1).toLowerCase()
    ),
    code: record.state_po!,
    year: Number(record.year),
    total: Number(record.totalvotes),
    dem: 0,
    rep: 0,
  };
  const party = (record.party ?? "").toLowerCase();
  const votes = Number(record.candidatevotes) || 0;
  if (DEM.has(party)) entry.dem += votes;
  else if (REP.has(party)) entry.rep += votes;
  byStateYear.set(key, entry);
}

const rows: Row[] = [...byStateYear.values()]
  .sort((a, b) => a.code.localeCompare(b.code) || a.year - b.year)
  .map((entry) => {
    const demShare = (100 * entry.dem) / entry.total;
    const repShare = (100 * entry.rep) / entry.total;
    return {
      State: entry.state,
      Code: entry.code,
      Year: entry.year,
      "Democratic share": Math.round(demShare * 10) / 10,
      "Republican share": Math.round(repShare * 10) / 10,
      Margin: Math.round((demShare - repShare) * 10) / 10,
      Winner: demShare > repShare ? "Democrat" : "Republican",
    };
  });

const years = new Set(rows.map((row) => row.Year));
const written = writeCsv(
  outFile,
  [
    "State",
    "Code",
    "Year",
    "Democratic share",
    "Republican share",
    "Margin",
    "Winner",
  ],
  rows
);
console.log(
  `${written.rows} state-elections across ${years.size} elections written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
