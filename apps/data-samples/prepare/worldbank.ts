// Prepares the World Development Indicators analysis from the World Bank API:
// a population base of country-years, three indicator tables on the same key,
// country metadata, and a derived 2000/2023 electricity endpoint table.
//
//   node --experimental-strip-types prepare/worldbank.ts [--cache <dir>]
//
// The API is live, so the first run caches its responses in the cache folder;
// later runs reuse them. Delete the cached files to take a new vintage.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cachedDownload,
  sha256,
  writeCsv,
  writeFacts,
  type Row,
} from "./lib.ts";
import { describe, pearson, round } from "./stats.ts";

const FIRST_YEAR = 2000;
const LAST_YEAR = 2023;
const INDICATORS = {
  population: "SP.POP.TOTL",
  gdp: "NY.GDP.PCAP.PP.KD",
  life: "SP.DYN.LE00.IN",
  electricity: "EG.ELC.ACCS.ZS",
} as const;

const root = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(root, "apps/demo/public/datasets/worldbank");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir = path.join(
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache"),
  "worldbank"
);

type ApiMeta = { total: number; lastupdated?: string; pages: number };
async function api(name: string, url: string) {
  const file = await cachedDownload(url, cacheDir, `${name}.json`);
  const [meta, rows] = JSON.parse(readFileSync(file, "utf8")) as [
    ApiMeta,
    unknown[],
  ];
  if (meta.pages !== 1)
    throw new Error(`${name}: expected one page, got ${meta.pages}`);
  return { meta, rows, url, sha256: sha256(file) };
}

type CountryRecord = {
  id: string;
  name: string;
  region: { value: string };
  incomeLevel: { value: string };
  capitalCity: string;
  longitude: string;
  latitude: string;
};
type IndicatorRecord = {
  countryiso3code: string;
  date: string;
  value: number | null;
};

const countryResponse = await api(
  "countries",
  "https://api.worldbank.org/v2/country?format=json&per_page=1000"
);
const allCountries = countryResponse.rows as CountryRecord[];
const economies = allCountries.filter(
  (item) => item.region.value.trim() !== "Aggregates"
);
const economyIds = new Set(economies.map((item) => item.id));

const indicatorResponses = Object.fromEntries(
  await Promise.all(
    Object.entries(INDICATORS).map(async ([name, id]) => [
      name,
      await api(
        name,
        `https://api.worldbank.org/v2/country/all/indicator/${id}?date=${FIRST_YEAR}:${LAST_YEAR}&format=json&per_page=20000`
      ),
    ])
  )
) as Record<keyof typeof INDICATORS, Awaited<ReturnType<typeof api>>>;

const key = (code: string, year: number | string) => `${code} ${year}`;
const duplicateKeys: string[] = [];
function indicatorRows(name: keyof typeof INDICATORS) {
  const seen = new Set<string>();
  const rows: Row[] = [];
  for (const record of indicatorResponses[name].rows as IndicatorRecord[]) {
    if (!economyIds.has(record.countryiso3code)) continue;
    const id = key(record.countryiso3code, record.date);
    if (seen.has(id)) duplicateKeys.push(`${name}:${id}`);
    seen.add(id);
    rows.push({
      country_year: id,
      country_code: record.countryiso3code,
      year: Number(record.date),
      value: record.value,
    });
  }
  return rows;
}

// The population records define the base; every returned record stays,
// including ones with a null value.
const base = indicatorRows("population").map((row) => ({
  country_year: row.country_year,
  country_code: row.country_code,
  year: row.year,
  year_start: `${row.year}-01-01`,
  population: row.value,
}));
const gdp = indicatorRows("gdp")
  .filter((row) => row.value !== null)
  .map((row) => ({
    country_year: row.country_year,
    gdp_pc: round(row.value as number, 0),
    log10_gdp_pc:
      (row.value as number) > 0
        ? round(Math.log10(row.value as number), 4)
        : null,
  }));
const life = indicatorRows("life")
  .filter((row) => row.value !== null)
  .map((row) => ({
    country_year: row.country_year,
    life_expectancy: round(row.value as number, 2),
  }));
const electricity = indicatorRows("electricity")
  .filter((row) => row.value !== null)
  .map((row) => ({
    country_year: row.country_year,
    electricity_pct: round(row.value as number, 2),
  }));

const countries = economies
  .map((item) => ({
    country_code: item.id,
    name: item.name,
    region: item.region.value.trim(),
    income: item.incomeLevel.value.trim(),
    capital: item.capitalCity || null,
    latitude: item.latitude === "" ? null : Number(item.latitude),
    longitude: item.longitude === "" ? null : Number(item.longitude),
  }))
  .sort((a, b) => a.country_code.localeCompare(b.country_code));

// One row per economy with access at both endpoints and base records there.
const electricityByKey = new Map(
  electricity.map((row) => [row.country_year, row.electricity_pct])
);
const baseKeys = new Set(base.map((row) => row.country_year));
const endpoints = countries.map((country) => {
  const start =
    electricityByKey.get(key(country.country_code, FIRST_YEAR)) ?? null;
  const end =
    electricityByKey.get(key(country.country_code, LAST_YEAR)) ?? null;
  const complete =
    start !== null &&
    end !== null &&
    baseKeys.has(key(country.country_code, FIRST_YEAR)) &&
    baseKeys.has(key(country.country_code, LAST_YEAR));
  return {
    country_code: country.country_code,
    electricity_2000: start,
    electricity_2023: end,
    access_gain_pp: complete ? round(end! - start!, 2) : null,
    cohort: complete ? "Both endpoints" : "Missing an endpoint",
  };
});

// --- Audits ------------------------------------------------------------------

const lookupAudit = (rows: Row[]) => {
  const keys = new Set(rows.map((row) => row.country_year));
  return {
    rows: rows.length,
    matchedBase: base.filter((row) => keys.has(row.country_year)).length,
    lookupOnly: rows.filter((row) => !baseKeys.has(row.country_year as string))
      .length,
  };
};
const populationByYear = (year: number) =>
  base
    .filter((row) => row.year === year && typeof row.population === "number")
    .reduce((sum, row) => sum + (row.population as number), 0);
const audit = {
  vintage:
    countryResponse.meta.lastupdated ??
    indicatorResponses.population.meta.lastupdated,
  economies: economies.length,
  aggregatesExcluded: allCountries.length - economies.length,
  baseRows: base.length,
  baseNullPopulation: base.filter((row) => row.population === null).length,
  duplicateKeys: duplicateKeys.length,
  population2000: populationByYear(FIRST_YEAR),
  population2023: populationByYear(LAST_YEAR),
  gdp: lookupAudit(gdp),
  life: lookupAudit(life),
  electricity: lookupAudit(electricity),
  endpointCohort: endpoints.filter((row) => row.cohort === "Both endpoints")
    .length,
  countriesWithCoordinates: countries.filter((row) => row.latitude !== null)
    .length,
};

// --- Findings ----------------------------------------------------------------

const lookup = <T extends { country_year: unknown }>(rows: T[]) =>
  new Map(rows.map((row) => [row.country_year as string, row]));
const gdpBy = lookup(gdp);
const lifeBy = lookup(life);
const countryBy = new Map(countries.map((row) => [row.country_code, row]));
const latest = base
  .filter((row) => row.year === LAST_YEAR)
  .map((row) => ({
    ...row,
    gdp: gdpBy.get(row.country_year)?.log10_gdp_pc ?? null,
    life: lifeBy.get(row.country_year)?.life_expectancy ?? null,
    electricity: electricityByKey.get(row.country_year) ?? null,
    region: countryBy.get(row.country_code)?.region,
  }));
const fitted = latest.filter(
  (row) =>
    typeof row.gdp === "number" &&
    typeof row.life === "number" &&
    typeof row.population === "number"
);
const cohort = endpoints.filter((row) => row.cohort === "Both endpoints");
const withoutAccess = latest
  .filter(
    (row) =>
      typeof row.electricity === "number" && typeof row.population === "number"
  )
  .map((row) => ({
    ...row,
    without:
      (row.population as number) * (1 - (row.electricity as number) / 100),
  }));
const totalWithout = withoutAccess.reduce((sum, row) => sum + row.without, 0);
const eligiblePopulation = withoutAccess.reduce(
  (sum, row) => sum + (row.population as number),
  0
);
const byRegion = new Map<string, number>();
for (const row of withoutAccess)
  byRegion.set(row.region!, (byRegion.get(row.region!) ?? 0) + row.without);
const topRegion = [...byRegion.entries()].sort((a, b) => b[1] - a[1])[0]!;
const topCountries = [...withoutAccess]
  .sort((a, b) => b.without - a.without)
  .slice(0, 3)
  .map((row) => ({
    name: countryBy.get(row.country_code)!.name,
    millions: round(row.without / 1e6, 0),
    pct: round(row.electricity as number, 1),
  }));
const lowStart = cohort.filter((row) => (row.electricity_2000 as number) < 50);

const findings = {
  incomeLongevity: {
    countries: fitted.length,
    r: round(
      pearson(
        fitted.map((row) => row.gdp as number),
        fitted.map((row) => row.life as number)
      ),
      2
    ),
  },
  medianAccess: {
    start: round(
      describe(cohort.map((row) => row.electricity_2000 as number)).median,
      1
    ),
    end: round(
      describe(cohort.map((row) => row.electricity_2023 as number)).median,
      1
    ),
    countries: cohort.length,
  },
  universalAccess: {
    start: cohort.filter((row) => (row.electricity_2000 as number) >= 99.5)
      .length,
    end: cohort.filter((row) => (row.electricity_2023 as number) >= 99.5)
      .length,
  },
  withoutElectricity: {
    millions: round(totalWithout / 1e6, 0),
    weightedAccessPct: round(100 * (1 - totalWithout / eligiblePopulation), 1),
    meanCountryAccessPct: round(
      withoutAccess.reduce((sum, row) => sum + (row.electricity as number), 0) /
        withoutAccess.length,
      1
    ),
    topRegion: { region: topRegion[0], millions: round(topRegion[1] / 1e6, 0) },
    topCountries,
  },
  gains: {
    lowStartCountries: lowStart.length,
    lowStartMedianGain: round(
      describe(lowStart.map((row) => row.access_gain_pp as number)).median,
      1
    ),
    highStartMedianGain: round(
      describe(
        cohort
          .filter((row) => (row.electricity_2000 as number) >= 50)
          .map((row) => row.access_gain_pp as number)
      ).median,
      1
    ),
  },
};

// --- Write -------------------------------------------------------------------

const written = [
  writeCsv(path.join(outDir, "country-years.csv"), Object.keys(base[0]!), base),
  writeCsv(path.join(outDir, "gdp.csv"), Object.keys(gdp[0]!), gdp),
  writeCsv(
    path.join(outDir, "life-expectancy.csv"),
    Object.keys(life[0]!),
    life
  ),
  writeCsv(
    path.join(outDir, "electricity.csv"),
    Object.keys(electricity[0]!),
    electricity
  ),
  writeCsv(
    path.join(outDir, "countries.csv"),
    Object.keys(countries[0]!),
    countries
  ),
  writeCsv(
    path.join(outDir, "endpoints.csv"),
    Object.keys(endpoints[0]!),
    endpoints
  ),
];
const responses = [countryResponse, ...Object.values(indicatorResponses)].map(
  (item) => ({
    url: item.url,
    sha256: item.sha256,
    records: item.meta.total,
    lastupdated: item.meta.lastupdated ?? null,
  })
);
writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(
    {
      dataset: `World Development Indicators, ${FIRST_YEAR}–${LAST_YEAR}`,
      source: {
        name: "World Bank World Development Indicators",
        license: "CC BY 4.0",
        credit:
          "World Bank, World Development Indicators. Population: UN Population Division and national sources. GDP per capita, PPP: International Comparison Program. Life expectancy: UN Population Division. Electricity access: World Bank, Sustainable Energy for All.",
        indicators: INDICATORS,
        responses,
      },
      preparation: [
        "year_start: January 1 of the year, so charts can place years on a time axis.",
        `country-years: every population record the API returns for ${FIRST_YEAR}–${LAST_YEAR}, including null values; aggregate economies are excluded through country metadata.`,
        "gdp, life-expectancy, electricity: one row per country-year with a value; a missing row means no published value.",
        "GDP per capita is in constant 2021 international dollars (PPP); log10_gdp_pc is its base-10 logarithm.",
        "countries: current World Bank region and income group, not historical classifications; capital coordinates from the same metadata.",
        `endpoints: electricity access in ${FIRST_YEAR} and ${LAST_YEAR} and the gain in percentage points, only when both endpoints have a value and a base record.`,
      ],
      files: written,
      audit,
      findings,
    },
    null,
    2
  )}\n`
);
writeFacts("worldbank", { audit, findings });
console.log(JSON.stringify({ audit, findings }, null, 2));
