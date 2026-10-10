/**
 * Writes an illustrative forecast fan for the composition demo: quarterly
 * history for two measures, then three years of projections with nested
 * percentile bands. The intervals are supplied, not modeled; the editor
 * draws them. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types inflation_fan.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "inflation-fan.csv";

let state = 0x66616e21;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Measure {
  name: string;
  /** Long-run level the series drifts back to, and a quarterly shock scale. */
  level: number;
  shock: number;
  /** A one-off surge, in quarters from 2015 Q1, and its height. */
  surgeAt: number;
  surgeHeight: number;
  /** How fast the fan widens per projected quarter, in points. */
  spread: number;
}

const measures: Measure[] = [
  {
    name: "Inflation",
    level: 2,
    shock: 0.35,
    surgeAt: 26,
    surgeHeight: 8,
    spread: 0.45,
  },
  {
    name: "GDP growth",
    level: 1.6,
    shock: 0.5,
    surgeAt: 21,
    surgeHeight: -12,
    spread: 0.6,
  },
];

const HISTORY_QUARTERS = 40; // 2015 Q1 to 2024 Q4
const PROJECTED_QUARTERS = 12; // 2025 Q1 to 2027 Q4
const PERCENTILES = [10, 20, 30, 40, 60, 70, 80, 90];

const rows: string[] = [
  `Measure,Period,Year,Kind,Central,${PERCENTILES.map((p) => `P${p}`).join(",")}`,
];
const round = (value: number) => Math.round(value * 100) / 100;

for (const measure of measures) {
  let value = measure.level;
  const total = HISTORY_QUARTERS + PROJECTED_QUARTERS;
  for (let quarter = 0; quarter < total; quarter += 1) {
    const year = 2015 + Math.floor(quarter / 4);
    const period = `${year} Q${(quarter % 4) + 1}`;
    const yearNumber = year + (quarter % 4) / 4;
    // Mean-reverting walk with one surge that decays over a year.
    const since = quarter - measure.surgeAt;
    const surge =
      since >= 0 && since < 6
        ? measure.surgeHeight * Math.exp(-since / 1.5)
        : 0;
    value +=
      (measure.level - value) * 0.3 + (random() - 0.5) * 2 * measure.shock;
    const central = value + surge;
    if (quarter < HISTORY_QUARTERS) {
      rows.push(
        `${measure.name},${period},${yearNumber},history,${round(central)},${PERCENTILES.map(() => "").join(",")}`
      );
      continue;
    }
    const ahead = quarter - HISTORY_QUARTERS + 1;
    const width = measure.spread * Math.sqrt(ahead);
    // Percentiles of a roughly normal fan around the central path.
    const z = (p: number) => {
      const table: Record<number, number> = {
        10: -1.2816,
        20: -0.8416,
        30: -0.5244,
        40: -0.2533,
        60: 0.2533,
        70: 0.5244,
        80: 0.8416,
        90: 1.2816,
      };
      return table[p]!;
    };
    rows.push(
      `${measure.name},${period},${yearNumber},projection,${round(central)},${PERCENTILES.map(
        (p) => round(central + z(p) * width)
      ).join(",")}`
    );
  }
}

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} quarters written to ${output}`);
