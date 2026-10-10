// Prepares the measles strip composition example: annual measles cases per
// 100,000 people for 50 states and D.C., 1928–2012, as published in The
// Wall Street Journal's "Battling Infectious Diseases in the 20th Century".
//
//   node --experimental-strip-types prepare/measles.ts [--cache <dir>]
//
// The publisher's JSON holds [year, state_index, rate] triples with explicit
// null rates; its script holds the state order. This writes the complete
// 51 × 85 grid: a reported rate, an explicit null the publisher reported as
// not available, or the one cell (Alaska, 2003) the publisher has no record
// for at all. Missing stays missing; nothing is filled with zero.

import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedDownload, writeCsv, type Row } from "./lib.ts";

const DATA_URL =
  "https://graphics.wsj.com/infectious-diseases-and-vaccines/data/datum.json";
const SCRIPT_URL =
  "https://graphics.wsj.com/infectious-diseases-and-vaccines/js/script.min.js?v=49884a29ff";

const root = path.resolve(import.meta.dirname, "../../..");
const outFile = path.join(root, "apps/demo/public/datasets/measles.csv");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir =
  cacheArg > 0
    ? path.resolve(process.argv[cacheArg + 1]!)
    : path.join(root, "tmp/data-cache");

interface Entry {
  id: string;
  data: {
    chart_options: { vaccine_year: number };
    values: { data: [number, number, number | null][] };
  };
}

const entries = JSON.parse(
  readFileSync(
    await cachedDownload(DATA_URL, cacheDir, "wsj-datum.json"),
    "utf8"
  )
) as Entry[];
const measles = entries.find((entry) => entry.id === "measles");
if (!measles) throw new Error("No measles entry in datum.json");

// The publisher's label array, in its row order (by postal code).
const script = readFileSync(
  await cachedDownload(SCRIPT_URL, cacheDir, "wsj-script.min.js"),
  "utf8"
);
const labels = JSON.parse(
  script.match(/var a=(\[[^\]]*\])/)?.[1] ?? "[]"
) as string[];
if (labels.length !== 51)
  throw new Error(`Expected 51 labels, found ${labels.length}`);

const NAMES: Record<string, string> = {
  Alaska: "Alaska",
  "Ala.": "Alabama",
  "Ark.": "Arkansas",
  "Ariz.": "Arizona",
  "Calif.": "California",
  "Colo.": "Colorado",
  "Conn.": "Connecticut",
  "D.C.": "District of Columbia",
  "Del.": "Delaware",
  "Fla.": "Florida",
  "Ga.": "Georgia",
  Hawaii: "Hawaii",
  Iowa: "Iowa",
  Idaho: "Idaho",
  "Ill.": "Illinois",
  "Ind.": "Indiana",
  "Kan.": "Kansas",
  "Ky.": "Kentucky",
  "La.": "Louisiana",
  "Mass.": "Massachusetts",
  "Md.": "Maryland",
  Maine: "Maine",
  "Mich.": "Michigan",
  "Minn.": "Minnesota",
  "Mo.": "Missouri",
  "Miss.": "Mississippi",
  "Mont.": "Montana",
  "N.C.": "North Carolina",
  "N.D.": "North Dakota",
  "Neb.": "Nebraska",
  "N.H.": "New Hampshire",
  "N.J.": "New Jersey",
  "N.M": "New Mexico",
  "Nev.": "Nevada",
  "N.Y.": "New York",
  Ohio: "Ohio",
  "Okla.": "Oklahoma",
  "Ore.": "Oregon",
  "Pa.": "Pennsylvania",
  "R.I.": "Rhode Island",
  "S.C.": "South Carolina",
  "S.D.": "South Dakota",
  "Tenn.": "Tennessee",
  Texas: "Texas",
  Utah: "Utah",
  "Va.": "Virginia",
  "Vt.": "Vermont",
  "Wash.": "Washington",
  "Wis.": "Wisconsin",
  "W.Va.": "West Virginia",
  "Wyo.": "Wyoming",
};

const triples = measles.data.values.data;
const years = triples.map((triple) => triple[0]);
const firstYear = Math.min(...years);
const lastYear = Math.max(...years);
const byCell = new Map<string, number | null>();
for (const [year, index, rate] of triples) byCell.set(`${year}:${index}`, rate);

const rows: Row[] = [];
let reported = 0;
let notReported = 0;
let absent = 0;
labels.forEach((label, index) => {
  const state = NAMES[label];
  if (!state) throw new Error(`No state name for label ${label}`);
  for (let year = firstYear; year <= lastYear; year += 1) {
    const key = `${year}:${index}`;
    const has = byCell.has(key);
    const rate = byCell.get(key) ?? null;
    const status = !has
      ? "absent"
      : rate === null
        ? "not reported"
        : "reported";
    if (status === "reported") reported += 1;
    else if (status === "not reported") notReported += 1;
    else absent += 1;
    rows.push({
      State: state,
      Label: label,
      Order: index,
      Year: year,
      Rate: rate === null ? null : Math.round(rate * 100) / 100,
      Status: status,
    });
  }
});

const written = writeCsv(
  outFile,
  ["State", "Label", "Order", "Year", "Rate", "Status"],
  rows
);
console.log(
  `${written.rows} cells written to ${path.relative(root, outFile)}: ${reported} reported, ${notReported} not reported, ${absent} absent; vaccine year ${measles.data.chart_options.vaccine_year} (${written.sha256.slice(0, 12)})`
);
