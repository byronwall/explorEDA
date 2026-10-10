// Prepares the 2023 earthquakes analysis from one frozen USGS ComCat query:
// every M4.5+ earthquake from 2023-01-01 up to, not including, 2024-01-01.
//
//   node --experimental-strip-types prepare/earthquakes.ts [--cache <dir>]
//
// The catalogue revises events, so the first run caches the response in the
// cache folder and later runs reuse it. Delete it to take a new revision.

import { readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cachedDownload,
  readCsv,
  sha256,
  writeCsv,
  writeFacts,
  type Row,
} from "./lib.ts";
import { describe, round } from "./stats.ts";

const QUERY = {
  format: "csv",
  starttime: "2023-01-01",
  endtime: "2024-01-01",
  minmagnitude: "4.5",
  eventtype: "earthquake",
  orderby: "time-asc",
};
const QUERY_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?${new URLSearchParams(QUERY)}`;
const START = Date.parse("2023-01-01T00:00:00Z");
const END = Date.parse("2024-01-01T00:00:00Z");
const METADATA = [
  "nst",
  "gap",
  "dmin",
  "rms",
  "horizontalError",
  "depthError",
  "magError",
  "magNst",
];

const root = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(root, "apps/demo/public/datasets/earthquakes");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

const file = await cachedDownload(QUERY_URL, cacheDir, "usgs-2023-m45.csv");
const retrieved = statSync(file).mtime.toISOString();
const source = readCsv(readFileSync(file, "utf8"));

const number = (text: string | undefined) =>
  text === undefined || text.trim() === "" ? null : Number(text);
const depthBand = (depth: number | null) =>
  depth === null
    ? "5 Not recorded"
    : depth < 0
      ? "0 Above sea level"
      : depth < 70
        ? "1 Shallow, under 70 km"
        : depth < 300
          ? "2 Intermediate, 70–300 km"
          : "3 Deep, 300 km or more";
// The place text ends with a country, US state, or sea name after its last
// comma; a place without one is a named region.
const area = (place: string) => {
  const at = place.lastIndexOf(", ");
  return at >= 0
    ? place.slice(at + 2)
    : place.replace(/^\d+ km [NSEW]+ of /, "");
};

const outsideWindow: string[] = [];
const seen = new Set<string>();
const duplicateIds: string[] = [];
const events: Row[] = [];
for (const row of source) {
  const time = Date.parse(row.time!);
  if (!(time >= START && time < END)) {
    outsideWindow.push(row.id!);
    continue;
  }
  if (seen.has(row.id!)) duplicateIds.push(row.id!);
  seen.add(row.id!);
  const depth = number(row.depth);
  const present = METADATA.filter(
    (field) => number(row[field]) !== null
  ).length;
  events.push({
    id: row.id!,
    time: row.time!,
    date: row.time!.slice(0, 10),
    latitude: number(row.latitude),
    longitude: number(row.longitude),
    depth,
    depth_band: depthBand(depth),
    mag: number(row.mag),
    mag_type: row.magType || null,
    place: row.place || null,
    area: row.place ? area(row.place) : null,
    net: row.net || null,
    status: row.status || null,
    metadata_present: present,
    metadata_band:
      present <= 2 ? "0–2 of 8" : present <= 5 ? "3–5 of 8" : "6–8 of 8",
    nst: number(row.nst),
    gap: number(row.gap),
    rms: number(row.rms),
    horizontal_error: number(row.horizontalError),
    depth_error: number(row.depthError),
    mag_error: number(row.magError),
  });
}

// --- Audits ------------------------------------------------------------------

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const countBy = (field: string) => {
  const counts = new Map<string, number>();
  for (const row of events) {
    const key = String(row[field]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
};
const audit = {
  query: QUERY_URL,
  retrieved,
  sourceRows: source.length,
  events: events.length,
  outsideWindow: outsideWindow.length,
  duplicateIds: duplicateIds.length,
  mappable: events.filter(
    (row) => finite(row.latitude) && finite(row.longitude)
  ).length,
  finiteDepthAndMag: events.filter(
    (row) => finite(row.depth) && finite(row.mag)
  ).length,
  belowMinimum: events.filter(
    (row) => finite(row.mag) && (row.mag as number) < 4.5
  ).length,
};

// --- Findings ----------------------------------------------------------------

const magTypes = countBy("mag_type");
const commonType = magTypes[0]![0];
const days = countBy("date");
const depthBands = Object.fromEntries(countBy("depth_band"));
const areas = countBy("area").slice(0, 3);
const strongest = [...events].sort(
  (a, b) => (b.mag as number) - (a.mag as number)
)[0]!;
const byNet = new Map<string, { events: number; low: number }>();
for (const row of events) {
  const item = byNet.get(row.net as string) ?? { events: 0, low: 0 };
  item.events += 1;
  if (row.metadata_band === "0–2 of 8") item.low += 1;
  byNet.set(row.net as string, item);
}
const medianMag = (band: string) =>
  round(
    describe(
      events
        .filter(
          (row) =>
            row.mag_type === commonType &&
            row.depth_band === band &&
            finite(row.mag)
        )
        .map((row) => row.mag as number)
    ).median,
    2
  );

const findings = {
  busiestDay: { date: days[0]![0], events: days[0]![1] },
  medianPerDay: describe(days.map(([, count]) => count)).median,
  quietDays: 365 - days.length,
  depthBands,
  topAreas: areas.map(([name, count]) => ({ name, events: count })),
  strongest: {
    id: strongest.id,
    mag: strongest.mag,
    place: strongest.place,
    date: strongest.date,
  },
  commonMagType: { type: commonType, events: magTypes[0]![1] },
  magTypes: magTypes.length,
  medianMagCommonType: {
    shallow: medianMag("1 Shallow, under 70 km"),
    intermediate: medianMag("2 Intermediate, 70–300 km"),
    deep: medianMag("3 Deep, 300 km or more"),
  },
  usShare: round(((byNet.get("us")?.events ?? 0) / events.length) * 100, 1),
  lowMetadata: events.filter((row) => row.metadata_band === "0–2 of 8").length,
  networks: byNet.size,
};

// --- Write -------------------------------------------------------------------

const written = [
  writeCsv(path.join(outDir, "events.csv"), Object.keys(events[0]!), events),
];
writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(
    {
      dataset: "Earthquakes of magnitude 4.5 or more in 2023",
      source: {
        name: "USGS ANSS Comprehensive Earthquake Catalog (ComCat)",
        query: QUERY_URL,
        sha256: sha256(file),
        retrieved,
        license: "Public domain (U.S. Geological Survey)",
        credit:
          "U.S. Geological Survey, Earthquake Hazards Program, ANSS ComCat.",
      },
      preparation: [
        "events: one row per catalogue event in its preferred solution; the half-open window 2023-01-01 ≤ time < 2024-01-01 removes events at the inclusive end time.",
        "date: the UTC calendar date of the event time.",
        "depth_band: analyst-defined bands at 70 and 300 km; negative depths, above sea level, stay as their own band.",
        "area: the text after the last comma in the place description, else the named region.",
        `metadata_present: how many of ${METADATA.join(", ")} hold a number; zero counts as present.`,
        "Error fields keep USGS units and are used here only to show which are present.",
      ],
      files: written,
      audit,
      findings,
    },
    null,
    2
  )}\n`
);
writeFacts("earthquakes", { audit, findings });
console.log(JSON.stringify({ audit, findings }, null, 2));
