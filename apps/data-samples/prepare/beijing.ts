// Prepares the 2016 Beijing air quality analysis from the UCI Beijing
// Multi-Site Air Quality archive: a station-day grid, a station summary, and
// a reference-station daily table.
//
//   node --experimental-strip-types prepare/beijing.ts [--cache <dir>]
//
// Writes apps/demo/public/datasets/beijing/*.csv and manifest.json.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cachedDownload,
  readCsv,
  sha256,
  writeCsv,
  writeFacts,
  type Row,
} from "./lib.ts";
import { describe, pearson, round } from "./stats.ts";

const ARCHIVE_URL =
  "https://archive.ics.uci.edu/static/public/501/beijing+multi+site+air+quality+data.zip";
const ARCHIVE_SHA256 =
  "b04da438b2f331ac0ffd45aebdfec0d20d2367feb5f6948c4b1f7ce1191e33c4";
const YEAR = 2016;
/** A daily mean needs this many valid hours of 24. */
const MIN_HOURS = 20;

const root = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(root, "apps/demo/public/datasets/beijing");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const archive = await cachedDownload(ARCHIVE_URL, cacheDir, "beijing.zip");
if (sha256(archive) !== ARCHIVE_SHA256) {
  throw new Error(`${archive} does not match the pinned checksum`);
}
const unpacked = path.join(cacheDir, "beijing");
mkdirSync(unpacked, { recursive: true });
execFileSync("unzip", ["-o", "-q", archive, "-d", unpacked]);
execFileSync("unzip", [
  "-o",
  "-q",
  path.join(unpacked, "PRSA2017_Data_20130301-20170228.zip"),
  "-d",
  unpacked,
]);
const stationDir = path.join(unpacked, "PRSA_Data_20130301-20170228");
const stationFiles = readdirSync(stationDir)
  .filter((name) => name.endsWith(".csv"))
  .sort();

const MEASURES = {
  pm25: "PM2.5",
  pm10: "PM10",
  so2: "SO2",
  no2: "NO2",
  co: "CO",
  o3: "O3",
  temp: "TEMP",
  wspm: "WSPM",
} as const;
type Measure = keyof typeof MEASURES;

const pad = (value: number) => String(value).padStart(2, "0");
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const season = (month: number) =>
  month === 12 || month <= 2
    ? "Winter"
    : month <= 5
      ? "Spring"
      : month <= 8
        ? "Summer"
        : "Autumn";
const number = (text: string | undefined) =>
  text === undefined || text === "" || text === "NA" ? null : Number(text);

// Every date in the year, as publisher calendar labels.
const dates: Array<{ date: string; month: number }> = [];
for (
  let day = new Date(Date.UTC(YEAR, 0, 1));
  day.getUTCFullYear() === YEAR;
  day.setUTCDate(day.getUTCDate() + 1)
) {
  dates.push({
    date: `${YEAR}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`,
    month: day.getUTCMonth() + 1,
  });
}

let sourceHours = 0;
const duplicateHours: string[] = [];
const stationDays: Row[] = [];
const files: Array<{ file: string; sha256: string; rows: number }> = [];
for (const file of stationFiles) {
  const text = readFileSync(path.join(stationDir, file), "utf8");
  const rows = readCsv(text);
  files.push({ file, sha256: sha256(Buffer.from(text)), rows: rows.length });
  const byDay = new Map<string, Record<string, string>[]>();
  const seen = new Set<string>();
  for (const row of rows) {
    if (Number(row.year) !== YEAR) continue;
    sourceHours += 1;
    const date = `${row.year}-${pad(Number(row.month))}-${pad(Number(row.day))}`;
    const key = `${row.station} ${date} ${row.hour}`;
    if (seen.has(key)) duplicateHours.push(key);
    seen.add(key);
    const list = byDay.get(date) ?? [];
    list.push(row);
    byDay.set(date, list);
  }
  const station = rows[0]!.station!;
  for (const { date, month } of dates) {
    const hours = byDay.get(date) ?? [];
    const row: Row = {
      station_day: `${station} ${date}`,
      station,
      date,
      month: `${pad(month)} ${MONTHS[month - 1]}`,
      season: season(month),
      recorded_hours: hours.length,
    };
    for (const [id, column] of Object.entries(MEASURES) as Array<
      [Measure, string]
    >) {
      const values = hours
        .map((hour) => number(hour[column]))
        .filter(
          (value): value is number => value !== null && Number.isFinite(value)
        );
      if (id === "pm25") row.pm25_valid_hours = values.length;
      row[id] =
        values.length >= MIN_HOURS
          ? round(
              values.reduce((a, b) => a + b, 0) / values.length,
              id === "co" ? 0 : 1
            )
          : null;
    }
    row.pm25_coverage_pct = round(
      ((row.pm25_valid_hours as number) / 24) * 100,
      1
    );
    stationDays.push(row);
  }
}

const stations = [
  ...new Set(stationDays.map((row) => row.station as string)),
].sort();
const referenceStation = stations[0]!;

const stationSummary: Row[] = stations.map((station) => {
  const days = stationDays.filter((row) => row.station === station);
  const qualified = days.filter((row) => row.pm25 !== null);
  return {
    station,
    recorded_hours: days.reduce(
      (sum, row) => sum + (row.recorded_hours as number),
      0
    ),
    pm25_valid_hours: days.reduce(
      (sum, row) => sum + (row.pm25_valid_hours as number),
      0
    ),
    qualified_pm25_days: qualified.length,
    annual_pm25: round(
      qualified.reduce((sum, row) => sum + (row.pm25 as number), 0) /
        qualified.length,
      1
    ),
  };
});

const reference: Row[] = stationDays
  .filter((row) => row.station === referenceStation)
  .map((row) => ({
    date: row.date,
    station: row.station,
    pm25: row.pm25,
    pm25_valid_hours: row.pm25_valid_hours,
  }));

// --- Audits ------------------------------------------------------------------

const audit = {
  stations: stations.length,
  days: dates.length,
  stationDays: stationDays.length,
  expectedStationDays: stations.length * dates.length,
  sourceHours,
  expectedHours: stations.length * dates.length * 24,
  duplicateHours: duplicateHours.length,
  daysWithNoRecords: stationDays.filter((row) => row.recorded_hours === 0)
    .length,
  qualifiedPm25Days: stationDays.filter((row) => row.pm25 !== null).length,
  pm25ValidHours: stationDays.reduce(
    (sum, row) => sum + (row.pm25_valid_hours as number),
    0
  ),
  referenceStation,
  referenceQualifiedDays: reference.filter((row) => row.pm25 !== null).length,
};

// --- Findings ----------------------------------------------------------------

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const bySeason = (field: Measure, name: string) =>
  stationDays
    .filter((row) => row.season === name && finite(row[field]))
    .map((row) => row[field] as number);
const pairs = (rows: Row[], x: Measure, y: Measure) => {
  const kept = rows.filter((row) => finite(row[x]) && finite(row[y]));
  return {
    n: kept.length,
    r: round(
      pearson(
        kept.map((row) => row[x] as number),
        kept.map((row) => row[y] as number)
      ),
      2
    ),
  };
};
const coverageCells = new Map<string, { valid: number; days: number }>();
for (const row of stationDays) {
  const key = `${row.station}|${row.month}`;
  const cell = coverageCells.get(key) ?? { valid: 0, days: 0 };
  cell.valid += row.pm25_valid_hours as number;
  cell.days += 1;
  coverageCells.set(key, cell);
}
const lowestCell = [...coverageCells.entries()]
  .map(([key, cell]) => ({ key, pct: (cell.valid / (cell.days * 24)) * 100 }))
  .sort((a, b) => a.pct - b.pct)[0]!;
const worst = stationDays
  .filter((row) => finite(row.pm25))
  .sort((a, b) => (b.pm25 as number) - (a.pm25 as number))[0]!;
const sixPollutants: Measure[] = ["pm25", "pm10", "so2", "no2", "co", "o3"];

const withBoth = stationDays.filter(
  (row) => finite(row.o3) && finite(row.pm25)
);
const o3Cut = describe(withBoth.map((row) => row.o3 as number));
const highO3 = withBoth.filter((row) => (row.o3 as number) >= o3Cut.q3);

const findings = {
  highOzone: {
    threshold: round(o3Cut.q3, 1),
    days: highO3.length,
    medianPm25: round(
      describe(highO3.map((row) => row.pm25 as number)).median,
      1
    ),
    medianPm25AllDays: round(
      describe(withBoth.map((row) => row.pm25 as number)).median,
      1
    ),
    r: round(
      pearson(
        withBoth.map((row) => row.o3 as number),
        withBoth.map((row) => row.pm25 as number)
      ),
      2
    ),
  },
  pm25CoveragePct: round(
    (audit.pm25ValidHours / (audit.stationDays * 24)) * 100,
    1
  ),
  lowestCoverage: {
    station: lowestCell.key.split("|")[0],
    month: lowestCell.key.split("|")[1],
    pct: round(lowestCell.pct, 1),
  },
  medianPm25: Object.fromEntries(
    ["Winter", "Spring", "Summer", "Autumn"].map((name) => [
      name,
      round(describe(bySeason("pm25", name)).median, 1),
    ])
  ),
  medianO3: Object.fromEntries(
    ["Winter", "Summer"].map((name) => [
      name,
      round(describe(bySeason("o3", name)).median, 1),
    ])
  ),
  pm25No2: pairs(stationDays, "pm25", "no2"),
  tempO3: Object.fromEntries(
    ["Winter", "Spring", "Summer", "Autumn"].map((name) => [
      name,
      pairs(
        stationDays.filter((row) => row.season === name),
        "temp",
        "o3"
      ),
    ])
  ),
  worstDay: { station: worst.station, date: worst.date, pm25: worst.pm25 },
  completeSixPollutantDays: stationDays.filter((row) =>
    sixPollutants.every((field) => finite(row[field]))
  ).length,
};

// --- Write -------------------------------------------------------------------

const written = [
  writeCsv(
    path.join(outDir, "station-days.csv"),
    Object.keys(stationDays[0]!),
    stationDays
  ),
  writeCsv(
    path.join(outDir, "stations.csv"),
    Object.keys(stationSummary[0]!),
    stationSummary
  ),
  writeCsv(
    path.join(outDir, "reference-days.csv"),
    Object.keys(reference[0]!),
    reference
  ),
];
writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(
    {
      dataset: `Beijing air quality, ${YEAR} station-days`,
      source: {
        name: "Beijing Multi-Site Air Quality",
        url: ARCHIVE_URL,
        sha256: ARCHIVE_SHA256,
        license: "CC BY 4.0",
        credit:
          "Chen, S. (2017). Beijing Multi-Site Air Quality [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5RK5G. Air quality from the Beijing Municipal Environmental Monitoring Center.",
        stationFiles: files,
      },
      preparation: [
        `station-days: every station and every ${YEAR} date, ${stations.length} × ${dates.length}; a date with no source hours stays as a row with recorded_hours 0.`,
        `Each daily mean needs at least ${MIN_HOURS} valid hours of 24; otherwise it is empty. Concentrations in µg/m³, temperature in °C, wind speed in m/s.`,
        "Calendar components are the publisher's labels, not UTC instants. Rain is left out: its interval is not documented.",
        "Seasons: Winter is Dec–Feb of the same calendar year, Spring Mar–May, Summer Jun–Aug, Autumn Sep–Nov.",
        "stations: one row per station with its year's recorded and valid PM2.5 hours and its mean over qualified days.",
        `reference-days: ${referenceStation}, the first station by name, one row per date.`,
      ],
      files: written,
      audit,
      findings,
    },
    null,
    2
  )}\n`
);
writeFacts("beijing", { audit, findings });
console.log(JSON.stringify({ audit, findings }, null, 2));
