// Prepares the slope chart composition example: central government tax
// revenue as a share of GDP in 2000 and 2023 for the OECD members with both
// readings, from the World Bank's World Development Indicators.
//
//   node --experimental-strip-types prepare/tax-slope.ts [--cache <dir>]
//
// Two rows per country, one per year, with the change across the span and
// its direction, so a composition can draw one path per country between
// the two dates and color it by whether the share rose or fell.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const INDICATOR = "GC.TAX.TOTL.GD.ZS";
const SOURCE_URL = `https://api.worldbank.org/v2/country/all/indicator/${INDICATOR}?date=2000:2023&format=json&per_page=20000`;
const YEARS = [2000, 2023] as const;
// OECD members by ISO3 code. Japan reports no central government figure,
// and New Zealand, Türkiye, and Australia lack one of the two years.
const OECD = [
  "AUS",
  "AUT",
  "BEL",
  "CAN",
  "CHL",
  "COL",
  "CRI",
  "CZE",
  "DNK",
  "EST",
  "FIN",
  "FRA",
  "DEU",
  "GRC",
  "HUN",
  "ISL",
  "IRL",
  "ISR",
  "ITA",
  "JPN",
  "KOR",
  "LVA",
  "LTU",
  "LUX",
  "MEX",
  "NLD",
  "NZL",
  "NOR",
  "POL",
  "PRT",
  "SVK",
  "SVN",
  "ESP",
  "SWE",
  "CHE",
  "TUR",
  "GBR",
  "USA",
];
const NAMES: Record<string, string> = {
  KOR: "South Korea",
  SVK: "Slovakia",
  TUR: "Türkiye",
};

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/tax-slope.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Observation {
  country: { value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}
const [, observations] = JSON.parse(
  readFileSync(
    await cachedDownload(SOURCE_URL, cacheDir, `${INDICATOR}.json`),
    "utf8"
  )
) as [unknown, Observation[]];

const byCountry = new Map<
  string,
  { name: string; values: Map<number, number> }
>();
for (const observation of observations) {
  const code = observation.countryiso3code;
  if (!OECD.includes(code) || observation.value === null) continue;
  const entry = byCountry.get(code) ?? {
    name: NAMES[code] ?? observation.country.value,
    values: new Map(),
  };
  entry.values.set(Number(observation.date), observation.value);
  byCountry.set(code, entry);
}

const rows: Row[] = [];
const skipped: string[] = [];
for (const code of OECD) {
  const entry = byCountry.get(code);
  const start = entry?.values.get(YEARS[0]);
  const end = entry?.values.get(YEARS[1]);
  if (!entry || start === undefined || end === undefined) {
    skipped.push(code);
    continue;
  }
  const change = Math.round((end - start) * 10) / 10;
  for (const year of YEARS)
    rows.push({
      Country: entry.name,
      Code: code,
      Year: year,
      "Tax revenue": Math.round(entry.values.get(year)! * 10) / 10,
      "Change 2000–2023": change,
      Direction: change > 0 ? "Rose" : change < 0 ? "Fell" : "Held",
    });
}

const written = writeCsv(
  outFile,
  ["Country", "Code", "Year", "Tax revenue", "Change 2000–2023", "Direction"],
  rows
);
console.log(
  `${written.rows} rows (${rows.length / YEARS.length} countries) written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)}); skipped ${skipped.join(", ")}`
);
