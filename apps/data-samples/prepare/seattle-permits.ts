// Prepares the Seattle permits Daily family: building permits applied for
// from 2014 through 2019 that name a contractor, from the City of Seattle's
// Building Permits dataset (data.seattle.gov, 76t5-zqzr), which the city
// publishes as Public Domain. Contractor names are typed by hand, so one firm
// can appear under several spellings.
//
//   node --experimental-strip-types prepare/seattle-permits.ts [--cache <dir>]
//
// The first run caches the API response; the dataset is updated daily, so
// a fresh cache can differ slightly from the shipped file.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://data.seattle.gov/resource/76t5-zqzr.csv?" +
  new URLSearchParams({
    $select: "permitnum,permitclass,applieddate,contractorcompanyname",
    $where:
      "contractorcompanyname IS NOT NULL AND applieddate between '2014-01-01' and '2019-12-31T23:59:59'",
    $order: "permitnum",
    $limit: "50000",
  });

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(
  root,
  "apps/demo/public/daily-viz/projects/seattle-permits/data/permits.csv"
);
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const file = await cachedDownload(
  SOURCE_URL,
  cacheDir,
  "seattle-permits-2014-2019.csv"
);
const rows: Row[] = readCsv(readFileSync(file, "utf8")).map((row) => ({
  Permit: row.permitnum!,
  Class: row.permitclass || null,
  Applied: String(row.applieddate ?? "").slice(0, 10),
  // Kept exactly as typed: the piece is about its spellings.
  Contractor: row.contractorcompanyname!,
}));
if (rows.length < 9000)
  throw new Error(`Expected ~9,500 rows, got ${rows.length}`);

const written = writeCsv(
  outFile,
  ["Permit", "Class", "Applied", "Contractor"],
  rows
);
console.log(
  `${written.rows} permits written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
