// Prepares the bump chart composition example: the economies that ranked in
// the world's top twelve by GDP in any year from 1980 to 2023, with every
// year's GDP in current US dollars, from the World Bank's World Development
// Indicators.
//
//   node --experimental-strip-types prepare/gdp-ranks.ts [--cache <dir>]
//
// One row per country and year, with the World Bank region, so a
// composition can rank the countries at each year and join each one's
// ranks into a path.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const INDICATOR = "NY.GDP.MKTP.CD";
const YEARS: [number, number] = [1980, 2023];
const TOP = 12;
const SOURCE_URL = `https://api.worldbank.org/v2/country/all/indicator/${INDICATOR}?date=${YEARS[0]}:${YEARS[1]}&format=json&per_page=20000`;
const COUNTRIES_URL =
  "https://api.worldbank.org/v2/country?format=json&per_page=400";
const NAMES: Record<string, string> = {
  KOR: "South Korea",
  RUS: "Russia",
  IRN: "Iran",
};

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/gdp-ranks.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Country {
  id: string;
  name: string;
  region: { value: string };
}
interface Observation {
  country: { value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}
const [, countries] = JSON.parse(
  readFileSync(
    await cachedDownload(COUNTRIES_URL, cacheDir, "wb-countries.json"),
    "utf8"
  )
) as [unknown, Country[]];
// Regional and income aggregates share the indicator table; keep economies.
const regions = new Map(
  countries
    .filter((country) => country.region.value.trim() !== "Aggregates")
    .map((country) => [country.id, country.region.value.trim()])
);
const [, observations] = JSON.parse(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, `${INDICATOR}.json`),
    "utf8"
  )
) as [unknown, Observation[]];

const byYear = new Map<number, { code: string; value: number }[]>();
const names = new Map<string, string>();
for (const item of observations) {
  const code = item.countryiso3code;
  if (!regions.has(code) || item.value === null) continue;
  names.set(code, NAMES[code] ?? item.country.value);
  const year = Number(item.date);
  const list = byYear.get(year) ?? [];
  list.push({ code, value: item.value });
  byYear.set(year, list);
}
const shown = new Set<string>();
for (const list of byYear.values()) {
  list.sort((a, b) => b.value - a.value);
  for (const item of list.slice(0, TOP)) shown.add(item.code);
}

const rows: Row[] = [];
for (const year of [...byYear.keys()].sort((a, b) => a - b))
  for (const item of byYear.get(year)!)
    if (shown.has(item.code))
      rows.push({
        Country: names.get(item.code)!,
        Code: item.code,
        Region: regions.get(item.code)!,
        Year: year,
        "GDP (current US$)": Math.round(item.value),
      });

const written = writeCsv(
  outFile,
  ["Country", "Code", "Region", "Year", "GDP (current US$)"],
  rows
);
console.log(
  `${written.rows} rows for ${shown.size} economies written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
