// Computes the findings the Wine analysis quotes from the bundled UCI red
// wine table. The table itself is unchanged.
//
//   node --experimental-strip-types prepare/wine.ts

import { readFileSync } from "node:fs";
import path from "node:path";
import { readCsv, writeFacts } from "./lib.ts";
import { describe, pearson, round } from "./stats.ts";

const root = path.resolve(import.meta.dirname, "../../..");
const text = readFileSync(
  path.join(root, "apps/demo/public/datasets/wine-quality-red.csv"),
  "utf8"
);
const wines = readCsv(text, text.split("\n")[0]!.includes(";") ? ";" : ",").map(
  (row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, Number(value)])
    )
);
const band = (quality: number) =>
  quality <= 5
    ? "Ordinary (3–5)"
    : quality === 6
      ? "Good (6)"
      : "Excellent (7–8)";
const bands = ["Ordinary (3–5)", "Good (6)", "Excellent (7–8)"];
const field = (name: string, label: string) =>
  wines.filter((row) => band(row.quality!) === label).map((row) => row[name]!);
const medians = (name: string, digits: number) =>
  Object.fromEntries(
    bands.map((label) => [
      label,
      round(describe(field(name, label)).median, digits),
    ])
  );

const facts = {
  wines: wines.length,
  bandCounts: Object.fromEntries(
    bands.map((label) => [label, field("quality", label).length])
  ),
  medianAlcohol: medians("alcohol", 1),
  medianVolatileAcidity: medians("volatile acidity", 2),
  medianSulphates: medians("sulphates", 2),
  alcoholDensityR: round(
    pearson(
      wines.map((row) => row.alcohol!),
      wines.map((row) => row.density!)
    ),
    2
  ),
  alcoholQualityR: round(
    pearson(
      wines.map((row) => row.alcohol!),
      wines.map((row) => row.quality!)
    ),
    2
  ),
  volatileQualityR: round(
    pearson(
      wines.map((row) => row["volatile acidity"]!),
      wines.map((row) => row.quality!)
    ),
    2
  ),
};
writeFacts("wine", facts);
console.log(JSON.stringify(facts, null, 2));
