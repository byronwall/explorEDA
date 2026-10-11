/**
 * Writes illustrative daily global air temperatures for the climate
 * ridgeline demo: one reading a day from 1940 to 2023, as the difference
 * from a 1991–2020 average in °C. Each year's level follows the broad shape
 * of the published ERA5 record (a flat, cool middle century, then steady
 * warming, warm El Niño years, and a 2023 that ran hotter as it went), but
 * the daily values are synthetic. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types global_temperature.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "daily-global-temperature.csv";

let state = 0x636c696d;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// A roughly normal draw from the sum of three uniforms.
const noise = () => random() + random() + random() - 1.5;

// The year's average difference, at a few years, joined by straight lines.
const keyframes: [number, number][] = [
  [1940, -0.62],
  [1944, -0.5],
  [1950, -0.72],
  [1965, -0.68],
  [1976, -0.74],
  [1980, -0.5],
  [1990, -0.35],
  [2000, -0.2],
  [2010, 0.02],
  [2015, 0.18],
  [2020, 0.3],
  [2022, 0.28],
];
// El Niño years run warmer than the trend.
const bumps: Record<number, number> = {
  1941: 0.08,
  1973: 0.08,
  1983: 0.1,
  1988: 0.08,
  1998: 0.22,
  2010: 0.08,
  2016: 0.24,
  2019: 0.08,
  2020: 0.08,
};

function trend(year: number) {
  for (let index = 1; index < keyframes.length; index += 1) {
    const [x1, y1] = keyframes[index]!;
    const [x0, y0] = keyframes[index - 1]!;
    if (year <= x1) return y0 + ((year - x0) / (x1 - x0)) * (y1 - y0);
  }
  return keyframes[keyframes.length - 1]![1];
}

const rows: string[] = ["Year,Day,Difference"];
for (let year = 1940; year <= 2023; year += 1) {
  const level = trend(year) + (bumps[year] ?? 0) + noise() * 0.06;
  const phase = random() * Math.PI * 2;
  const swing = 0.08 + random() * 0.08;
  for (let day = 1; day <= 365; day += 1) {
    // A slow wander through the year, plus day-to-day weather.
    let value =
      level +
      swing * Math.sin((day / 365) * Math.PI * 2 + phase) +
      noise() * 0.09;
    // 2023 began near the recent average and climbed through the second half.
    if (year === 2023)
      value = 0.32 + 0.62 / (1 + Math.exp(-(day - 175) / 22)) + noise() * 0.1;
    rows.push(`${year},${day},${value.toFixed(3)}`);
  }
}
writeFileSync(output, `${rows.join("\n")}\n`);
