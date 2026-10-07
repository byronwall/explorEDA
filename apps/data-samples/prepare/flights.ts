// Prepares the January 2013 flights analysis from the pinned nycflights13
// 1.0.2 package: flights, airlines, planes, and weather as separate tables.
//
//   node --experimental-strip-types prepare/flights.ts [--cache <dir>]
//
// Writes apps/demo/public/datasets/flights/*.csv and manifest.json.

import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  cachedDownload,
  readRdaFrame,
  sha256,
  writeCsv,
  writeFacts,
  type Row,
} from "./lib.ts";
import { describe, pearson, round } from "./stats.ts";

const PACKAGE_URL =
  "https://cran.r-project.org/src/contrib/nycflights13_1.0.2.tar.gz";
const PACKAGE_SHA256 =
  "0e87c5a4e285f16750e91c75aeba33b1e4682cdabf4a3effe5a1de7398394a1d";

const root = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(root, "apps/demo/public/datasets/flights");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const archive = await cachedDownload(PACKAGE_URL, cacheDir);
if (sha256(archive) !== PACKAGE_SHA256) {
  throw new Error(`${archive} does not match the pinned checksum`);
}
const unpacked = path.join(cacheDir, "nycflights13-1.0.2");
mkdirSync(unpacked, { recursive: true });
execFileSync("tar", ["xzf", archive, "-C", unpacked]);
const data = (name: string) =>
  readRdaFrame(path.join(unpacked, "nycflights13/data", `${name}.rda`)).rows;

const pad = (value: number) => String(value).padStart(2, "0");
const day = (row: Row) =>
  `${row.year}-${pad(row.month as number)}-${pad(row.day as number)}`;
// The scheduled hour in New York local time, as the package records it.
const weatherKey = (row: Row) =>
  `${row.origin} ${day(row)} ${pad(row.hour as number)}:00`;

// IDs come from the row position in the full 1.0.2 table, before the subset.
const allFlights = data("flights");
const flights: Row[] = [];
allFlights.forEach((row, index) => {
  if (row.year !== 2013 || row.month !== 1) return;
  flights.push({
    flight_id: `F${index + 1}`,
    flight_date: day(row),
    sched_dep_hour: row.hour,
    dep_delay: row.dep_delay,
    arr_delay: row.arr_delay,
    carrier: row.carrier,
    flight: `${row.carrier}${row.flight}`,
    tailnum: row.tailnum,
    origin: row.origin,
    dest: row.dest,
    air_time: row.air_time,
    distance: row.distance,
    weather_key: weatherKey(row),
  });
});

const airlines = data("airlines");
const planes = data("planes").map((row) => ({
  tailnum: row.tailnum,
  plane_year: row.year,
  manufacturer: row.manufacturer,
  model: row.model,
  engines: row.engines,
  seats: row.seats,
  engine: row.engine,
}));
const weather = data("weather")
  .filter((row) => row.year === 2013 && row.month === 1)
  .map((row) => ({
    weather_key: weatherKey(row),
    origin: row.origin,
    observed_hour: `${day(row)} ${pad(row.hour as number)}:00`,
    temp: row.temp,
    humid: row.humid,
    wind_speed:
      row.wind_speed === null ? null : round(row.wind_speed as number, 2),
    precip: row.precip,
    visib: row.visib,
  }));

// --- Audits: lookups must keep the flight population and its totals. -------

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const countBy = <T>(rows: T[], key: (row: T) => unknown) => {
  const counts = new Map<unknown, number>();
  for (const row of rows) counts.set(key(row), (counts.get(key(row)) ?? 0) + 1);
  return counts;
};
const duplicates = (rows: Row[], field: string) =>
  [...countBy(rows, (row) => row[field]).entries()]
    .filter(([key, count]) => key !== null && count > 1)
    .map(([key, count]) => ({ key, count }));

const carrierKeys = new Set(airlines.map((row) => row.carrier));
const planeKeys = new Set(planes.map((row) => row.tailnum));
const weatherCounts = countBy(weather, (row) => row.weather_key);
const withTail = flights.filter((row) => row.tailnum !== null);

const audit = {
  flights: flights.length,
  uniqueFlightIds: new Set(flights.map((row) => row.flight_id)).size,
  finiteDepDelay: flights.filter((row) => finite(row.dep_delay)).length,
  finiteArrDelay: flights.filter((row) => finite(row.arr_delay)).length,
  pairedDelays: flights.filter(
    (row) => finite(row.dep_delay) && finite(row.arr_delay)
  ).length,
  distanceSum: flights.reduce((sum, row) => sum + (row.distance as number), 0),
  operatingDays: new Set(flights.map((row) => row.flight_date)).size,
  lookups: {
    airlines: {
      matched: flights.filter((row) => carrierKeys.has(row.carrier)).length,
      duplicateKeys: duplicates(airlines, "carrier"),
    },
    planes: {
      missingTailnum: flights.length - withTail.length,
      matched: withTail.filter((row) => planeKeys.has(row.tailnum)).length,
      unmatched: withTail.filter((row) => !planeKeys.has(row.tailnum)).length,
      duplicateKeys: duplicates(planes, "tailnum"),
    },
    weather: {
      matched: flights.filter((row) => weatherCounts.get(row.weather_key) === 1)
        .length,
      unmatched: flights.filter((row) => !weatherCounts.has(row.weather_key))
        .length,
      ambiguous: flights.filter(
        (row) => (weatherCounts.get(row.weather_key) ?? 0) > 1
      ).length,
      duplicateKeys: duplicates(weather, "weather_key"),
    },
  },
};

// --- Findings quoted in the analysis. Computed from the frozen tables. -----

const band = (value: Row[string]) =>
  !finite(value)
    ? "Not recorded"
    : value <= 0
      ? "On time or early"
      : value <= 15
        ? "Up to 15 min"
        : value <= 60
          ? "15–60 min"
          : "Over 60 min";
const paired = flights.filter(
  (row) => finite(row.dep_delay) && finite(row.arr_delay)
);
const departedLate = flights.filter(
  (row) => finite(row.dep_delay) && (row.dep_delay as number) > 60
);
const arrivedOnTimeAfterLate = paired.filter(
  (row) => (row.dep_delay as number) > 0 && (row.arr_delay as number) <= 0
).length;
const lateDepartures = paired.filter((row) => (row.dep_delay as number) > 0);
const byDay = new Map<string, number[]>();
for (const row of flights) {
  if (!finite(row.dep_delay)) continue;
  const list = byDay.get(row.flight_date as string) ?? [];
  list.push(row.dep_delay);
  byDay.set(row.flight_date as string, list);
}
const dailyMeans = [...byDay.entries()]
  .map(([date, delays]) => ({
    date,
    mean: delays.reduce((a, b) => a + b, 0) / delays.length,
    flights: delays.length,
  }))
  .sort((a, b) => b.mean - a.mean);
const weatherByKey = new Map(weather.map((row) => [row.weather_key, row]));
const lowVisibility = flights.filter((row) => {
  const hour = weatherByKey.get(row.weather_key as string);
  return finite(row.dep_delay) && hour && finite(hour.visib) && hour.visib < 3;
});
const clearVisibility = flights.filter((row) => {
  const hour = weatherByKey.get(row.weather_key as string);
  return (
    finite(row.dep_delay) && hour && finite(hour.visib) && hour.visib >= 10
  );
});
const median = (values: number[]) => describe(values).median;
const mean = (values: number[]) =>
  values.reduce((a, b) => a + b, 0) / values.length;

const meanDelayForHours = (from: number, to: number) => {
  const delays = flights
    .filter(
      (row) =>
        finite(row.dep_delay) &&
        (row.sched_dep_hour as number) >= from &&
        (row.sched_dep_hour as number) <= to
    )
    .map((row) => row.dep_delay as number);
  return { flights: delays.length, meanDepDelay: round(mean(delays), 1) };
};

const findings = {
  morning: { hours: "5–9", ...meanDelayForHours(5, 9) },
  evening: { hours: "17–21", ...meanDelayForHours(17, 21) },
  bandCounts: Object.fromEntries([
    ...countBy(flights, (row) => band(row.dep_delay)).entries(),
  ]),
  overHourDepartures: departedLate.length,
  overHourStillOverHour: departedLate.filter(
    (row) => finite(row.arr_delay) && (row.arr_delay as number) > 60
  ).length,
  lateDeparturesArrivingOnTime: arrivedOnTimeAfterLate,
  lateDeparturesWithArrival: lateDepartures.length,
  delayCorrelation: round(
    pearson(
      paired.map((row) => row.dep_delay as number),
      paired.map((row) => row.arr_delay as number)
    ),
    3
  ),
  medianDepDelay: median(
    flights
      .filter((row) => finite(row.dep_delay))
      .map((row) => row.dep_delay as number)
  ),
  meanDepDelay: round(
    mean(
      flights
        .filter((row) => finite(row.dep_delay))
        .map((row) => row.dep_delay as number)
    ),
    1
  ),
  worstDays: dailyMeans.slice(0, 3).map((item) => ({
    ...item,
    mean: round(item.mean, 1),
  })),
  bestDay: { ...dailyMeans.at(-1)!, mean: round(dailyMeans.at(-1)!.mean, 1) },
  lowVisibility: {
    flights: lowVisibility.length,
    meanDepDelay: round(
      mean(lowVisibility.map((row) => row.dep_delay as number)),
      1
    ),
  },
  clearVisibility: {
    flights: clearVisibility.length,
    meanDepDelay: round(
      mean(clearVisibility.map((row) => row.dep_delay as number)),
      1
    ),
  },
};

// --- Write the tables and the manifest. ------------------------------------

const files = [
  writeCsv(path.join(outDir, "flights.csv"), Object.keys(flights[0]!), flights),
  writeCsv(path.join(outDir, "airlines.csv"), ["carrier", "name"], airlines),
  writeCsv(path.join(outDir, "planes.csv"), Object.keys(planes[0]!), planes),
  writeCsv(path.join(outDir, "weather.csv"), Object.keys(weather[0]!), weather),
];

const manifest = {
  dataset: "January 2013 flights from New York City",
  source: {
    name: "nycflights13",
    version: "1.0.2",
    url: PACKAGE_URL,
    sha256: PACKAGE_SHA256,
    license: "CC0",
    credit:
      "Hadley Wickham, nycflights13. Flights: Bureau of Transportation Statistics. Aircraft: FAA. Weather: Iowa Environmental Mesonet.",
  },
  preparation: [
    "flights: every 2013 January record, including missing times and delays; flight_id is F plus the row position in the full 1.0.2 table.",
    "flight: carrier code plus flight number; flight numbers repeat across carriers and days.",
    "weather_key: origin, local date, and scheduled hour, built the same way for flights and weather.",
    "planes: every aircraft in the package, so lookup-only aircraft stay visible; year renamed plane_year.",
    "weather: every January 2013 origin-hour; precipitation in inches, visibility in miles, temperature in °F.",
    "airports is excluded: its OpenFlights source has separate terms.",
  ],
  files,
  audit,
  findings,
};
writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);
writeFacts("flights", { audit, findings });
console.log(JSON.stringify({ audit, findings }, null, 2));
