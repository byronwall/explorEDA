/**
 * Writes banana yields for the sparkline-table demo: the fifteen countries
 * with the highest long-term average yield, in tonnes per hectare, with each
 * decade's average from the 1960s to the 2010s as shown in Joel Soroos's
 * table of Our World in Data figures. An "NA" decade has one row without a
 * yield.
 *
 * The yearly values behind each trend line are illustrative: drawn so that
 * every decade's years average to its published value, with a fixed seed.
 *
 *   node --experimental-strip-types banana_yields.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "banana-yields.csv";

let state = 0x62616e61;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const decades = [1960, 1970, 1980, 1990, 2000, 2010];
// Decade averages from the 1960s to the 2010s; null where the table reads NA.
const countries: [string, (number | null)[]][] = [
  ["Mali", [60.0, 60.8, 60.5, 62.1, 54.7, 35.4]],
  ["Nicaragua", [40.8, 58.3, 44.4, 44.4, 50.2, 56.5]],
  ["Panama", [45.2, 47.4, 47.8, 43.6, 43.8, 37.9]],
  ["Costa Rica", [20.4, 34.2, 49.3, 46.2, 48.2, 52.7]],
  ["South Korea", [null, null, 31.4, 49.6, null, null]],
  ["Honduras", [29.0, 34.1, 47.3, 43.0, 33.0, 45.0]],
  ["Spain", [36.2, 31.3, 37.8, 42.4, 40.9, 42.0]],
  ["Israel", [21.9, 29.9, 41.4, 41.6, 42.9, 49.8]],
  ["Palestine", [null, null, null, 38.0, 30.4, 26.6]],
  ["Colombia", [23.5, 31.0, 42.7, 34.0, 27.9, 28.0]],
  ["Egypt", [19.6, 22.2, 21.6, 32.7, 42.0, 45.6]],
  ["Guatemala", [16.4, 18.1, 22.3, 34.3, 45.6, 46.8]],
  ["Indonesia", [6.1, 7.4, 12.9, 44.1, 53.5, 59.6]],
  ["Morocco", [null, 16.7, 19.9, 31.2, 35.9, 39.7]],
  ["Cote d'Ivoire", [13.3, 14.1, 18.3, 32.5, 43.2, 44.4]],
];

const rows: string[] = ["Country,Year,Decade,Yield"];
for (const [country, values] of countries) {
  values.forEach((average, index) => {
    const start = decades[index]!;
    // A decade the table reads NA keeps one row without a yield, so its
    // cell draws as not reported rather than blank.
    if (average === null) {
      rows.push(`"${country}",,${start}s,`);
      return;
    }
    // The 2010s run 2010 to 2018, as in the source.
    const years = start === 2010 ? 9 : 10;
    const wander = Array.from(
      { length: years },
      (_, at) =>
        Math.sin(at * 0.9 + random() * 6) * 0.06 + (random() - 0.5) * 0.08
    );
    const mean = wander.reduce((sum, value) => sum + value, 0) / years;
    wander.forEach((value, at) => {
      const yieldValue = average * (1 + value - mean);
      rows.push(
        `"${country}",${start + at},${start}s,${yieldValue.toFixed(2)}`
      );
    });
  });
}
writeFileSync(output, `${rows.join("\n")}\n`);
