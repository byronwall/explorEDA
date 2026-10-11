// Prepares the waffle composition example: every passenger on the Titanic,
// from the titanic3 list kept by Vanderbilt University's Department of
// Biostatistics (Thomas Cason's compilation from the Encyclopedia Titanica).
//
//   node --experimental-strip-types prepare/titanic.ts [--cache <dir>]
//
// One row per passenger with readable class, sex, port, and fate labels,
// so a composition can repeat by class and draw one cell per person.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, readCsv, writeCsv, type Row } from "./lib.ts";

const SOURCE_URL = "https://hbiostat.org/data/repo/titanic3.csv";
const CLASSES: Record<string, string> = {
  "1": "First class",
  "2": "Second class",
  "3": "Third class",
};
const PORTS: Record<string, string> = {
  C: "Cherbourg",
  Q: "Queenstown",
  S: "Southampton",
};

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/titanic.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const source = readCsv(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, "titanic3.csv"),
    "utf8"
  )
);
const rows: Row[] = [];
for (const record of source) {
  const klass = CLASSES[record.pclass ?? ""];
  if (!klass || !record.name) continue;
  const age = Number(record.age);
  rows.push({
    Name: record.name,
    Class: klass,
    Sex: record.sex === "female" ? "Female" : "Male",
    Age: Number.isFinite(age) && record.age !== "" ? age : null,
    "Age group":
      !Number.isFinite(age) || record.age === ""
        ? "Unknown"
        : age < 18
          ? "Child"
          : "Adult",
    Embarked: PORTS[record.embarked ?? ""] ?? "Unknown",
    Fare: record.fare === "" ? null : Number(record.fare),
    Fate: record.survived === "1" ? "Survived" : "Died",
  });
}

const written = writeCsv(
  outFile,
  ["Name", "Class", "Sex", "Age", "Age group", "Embarked", "Fare", "Fate"],
  rows
);
console.log(
  `${written.rows} passengers written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
