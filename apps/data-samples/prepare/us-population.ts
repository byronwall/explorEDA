// Prepares the population pyramid composition example: the United States
// population by age group and sex at each decennial census from 1850 to
// 2000, from the Census Bureau figures packaged in vega-datasets.
//
//   node --experimental-strip-types prepare/us-population.ts [--cache <dir>]
//
// One row per census, five-year age group, and sex, so a composition can
// repeat by age group and mirror the sexes about a baseline.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL =
  "https://raw.githubusercontent.com/vega/vega-datasets/main/data/population.json";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/us-population.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Observation {
  year: number;
  age: number;
  sex: 1 | 2;
  people: number;
}
const observations = JSON.parse(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "population.json"),
    "utf8"
  )
) as Observation[];

const rows: Row[] = observations
  .sort((a, b) => a.year - b.year || a.age - b.age || a.sex - b.sex)
  .map((item) => ({
    Year: item.year,
    Age: item.age,
    "Age group": item.age >= 90 ? "90 and over" : `${item.age}–${item.age + 4}`,
    Sex: item.sex === 1 ? "Male" : "Female",
    People: item.people,
  }));

const written = writeCsv(
  outFile,
  ["Year", "Age", "Age group", "Sex", "People"],
  rows
);
console.log(
  `${written.rows} rows written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
