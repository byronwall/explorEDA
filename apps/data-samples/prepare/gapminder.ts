// Prepares the annotated-scatter composition example from the World Bank
// tables already in the demo: one row per economy for 2023 with its region,
// income group, population, GDP per capita, and life expectancy.
//
//   node --experimental-strip-types prepare/gapminder.ts
//
// It reads apps/demo/public/datasets/worldbank/*.csv, so refresh those first
// with prepare/worldbank.ts when a new vintage is wanted.

import { readFileSync } from "node:fs";
import path from "node:path";
import { readCsv, writeCsv, type Row } from "./lib.ts";

const YEAR = "2023";
const root = path.resolve(import.meta.dirname, "../../..");
const dir = path.join(root, "apps/demo/public/datasets/worldbank");
const outFile = path.join(root, "apps/demo/public/datasets/gapminder-2023.csv");

const read = (name: string) =>
  readCsv(readFileSync(path.join(dir, name), "utf8"));
const countries = new Map(
  read("countries.csv").map((row) => [row.country_code, row])
);
const byKey = <T extends Record<string, string>>(rows: T[]) =>
  new Map(rows.map((row) => [row.country_year, row]));
const gdp = byKey(read("gdp.csv"));
const life = byKey(read("life-expectancy.csv"));

const rows: Row[] = [];
for (const record of read("country-years.csv")) {
  if (record.year !== YEAR) continue;
  const country = countries.get(record.country_code ?? "");
  const g = gdp.get(record.country_year ?? "");
  const l = life.get(record.country_year ?? "");
  if (!country || !g || !l) continue;
  rows.push({
    Country: country.name ?? "",
    Code: record.country_code ?? "",
    Region: country.region ?? "",
    Income: country.income ?? "",
    Population: Number(record.population),
    "GDP per capita": Number(g.gdp_pc),
    "Life expectancy": Number(l.life_expectancy),
  });
}
rows.sort((a, b) => String(a.Country).localeCompare(String(b.Country)));

const written = writeCsv(
  outFile,
  [
    "Country",
    "Code",
    "Region",
    "Income",
    "Population",
    "GDP per capita",
    "Life expectancy",
  ],
  rows
);
console.log(
  `${written.rows} economies for ${YEAR} written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
