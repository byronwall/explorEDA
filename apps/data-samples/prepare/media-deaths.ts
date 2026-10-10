// Prepares the normalized-stack composition example: what Americans died
// from in 2023 against the causes of death three news outlets covered, from
// Our World in Data's "media deaths" analysis package (CC BY).
//
//   node --experimental-strip-types prepare/media-deaths.ts [--cache <dir>]
//
// The package's results table has one row per cause with deaths and each
// outlet's article counts. This script melts it to one row per source and
// cause, keeping the package's corrected counts: accidents exclude drug
// overdoses, and mentions count articles that name a cause several times.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://catalog.owid.io/analyses/media-deaths-analysis-data.zip";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/media-deaths.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const zip = await cachedDownload(
  SOURCE_URL,
  cacheDir,
  "media-deaths-analysis-data.zip"
);
const results = readCsv(
  execFileSync("unzip", ["-p", zip, "data/media_deaths_results.csv"], {
    encoding: "utf8",
  })
);

const SOURCES: { name: string; column: string; measure: string }[] = [
  { name: "Deaths", column: "deaths", measure: "Deaths" },
  { name: "The New York Times", column: "nyt_mentions", measure: "Articles" },
  { name: "The Washington Post", column: "wapo_mentions", measure: "Articles" },
  { name: "Fox News", column: "fox_mentions", measure: "Articles" },
];

const CAUSE_NAMES: Record<string, string> = {
  accidents: "Accidents",
  alzheimers: "Alzheimer's",
  cancer: "Cancer",
  covid: "COVID-19",
  diabetes: "Diabetes",
  "drug overdose": "Drug overdose",
  "heart disease": "Heart disease",
  homicide: "Homicide",
  influenza: "Influenza",
  kidney: "Kidney disease",
  liver: "Liver disease",
  respiratory: "Respiratory disease",
  stroke: "Stroke",
  suicide: "Suicide",
  terrorism: "Terrorism",
};

const rows: Row[] = [];
for (const source of SOURCES) {
  for (const result of results) {
    const cause = CAUSE_NAMES[result.cause ?? ""];
    if (!cause) throw new Error(`Unexpected cause ${result.cause}`);
    const count = Number(result[source.column]);
    if (!Number.isFinite(count))
      throw new Error(`No ${source.column} for ${cause}`);
    rows.push({
      Source: source.name,
      Cause: cause,
      Year: Number(result.year),
      Measure: source.measure,
      Count: count,
    });
  }
}

const written = writeCsv(
  outFile,
  ["Source", "Cause", "Year", "Measure", "Count"],
  rows
);
console.log(
  `${written.rows} rows written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
