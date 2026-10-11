// Prepares the beeswarm composition example: carbon dioxide emissions per
// person in 2020 for every economy the World Bank reports, with its region,
// income group, and population, from the World Development Indicators.
//
//   node --experimental-strip-types prepare/co2-per-capita.ts [--cache <dir>]
//
// One row per economy, so a composition can repeat by region and swarm the
// economies along one shared emissions scale, sized by population.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const YEAR = 2020;
const CO2 = "EN.GHG.CO2.PC.CE.AR5";
const POPULATION = "SP.POP.TOTL";
const indicatorUrl = (indicator: string) =>
  `https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=${YEAR}&format=json&per_page=400`;
const COUNTRIES_URL =
  "https://api.worldbank.org/v2/country?format=json&per_page=400";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/co2-per-capita.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Country {
  id: string;
  name: string;
  region: { value: string };
  incomeLevel: { value: string };
}
interface Observation {
  countryiso3code: string;
  value: number | null;
}
const read = async <T>(url: string, name: string) =>
  JSON.parse(
    readFileSync(await cachedDownload(url, cacheDir, name), "utf8")
  )[1] as T;

const countries = (
  await read<Country[]>(COUNTRIES_URL, "wb-countries.json")
).filter((country) => country.region.value.trim() !== "Aggregates");
const emissions = new Map(
  (await read<Observation[]>(indicatorUrl(CO2), `${CO2}-${YEAR}.json`))
    .filter((item) => item.value !== null)
    .map((item) => [item.countryiso3code, item.value!])
);
const population = new Map(
  (
    await read<Observation[]>(
      indicatorUrl(POPULATION),
      `${POPULATION}-${YEAR}.json`
    )
  )
    .filter((item) => item.value !== null)
    .map((item) => [item.countryiso3code, item.value!])
);

const rows: Row[] = [];
for (const country of countries) {
  const tonnes = emissions.get(country.id);
  if (tonnes === undefined) continue;
  rows.push({
    Economy: country.name,
    Code: country.id,
    Region: country.region.value.trim(),
    "Income group": country.incomeLevel.value.replace(" income", ""),
    "CO2 per person": Math.round(tonnes * 1000) / 1000,
    Population: population.get(country.id) ?? null,
  });
}
rows.sort((a, b) => String(a.Economy).localeCompare(String(b.Economy)));

const written = writeCsv(
  outFile,
  ["Economy", "Code", "Region", "Income group", "CO2 per person", "Population"],
  rows
);
console.log(
  `${written.rows} economies written to ${path.relative(root, outFile)} (${written.sha256.slice(0, 12)})`
);
