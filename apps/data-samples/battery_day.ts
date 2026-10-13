/**
 * Writes one day of energy flows through a building's battery, in kWh per
 * hour: solar and grid import charge it (positive), and the building's load
 * and grid export draw it down (negative). The battery starts the day at 40
 * kWh, so a running total of the flows is its state of charge. The values
 * follow fixed daily curves, so the file is the same on every run.
 *
 *   node --experimental-strip-types battery_day.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "battery-day.csv";

const period = (hour: number) =>
  hour < 6
    ? "Night"
    : hour < 12
      ? "Morning"
      : hour < 18
        ? "Afternoon"
        : "Evening";

/** Solar output peaks at noon; none before 6:00 or after 19:00. */
const solar = (hour: number) =>
  hour < 6 || hour > 19
    ? 0
    : Math.round(14 * Math.sin(((hour - 6) / 14) * Math.PI) * 10) / 10;
/** Load has a morning and an evening peak over a base load. */
const load = (hour: number) =>
  Math.round(
    (3 +
      4 * Math.exp(-((hour - 8) ** 2) / 4) +
      7 * Math.exp(-((hour - 19) ** 2) / 5)) *
      10
  ) / 10;
/** Cheap night power charges the battery; midday surplus goes to the grid. */
const gridImport = (hour: number) => (hour >= 1 && hour <= 4 ? 5 : 0);
const gridExport = (hour: number) => (hour >= 11 && hour <= 14 ? 3 : 0);

const rows: string[] = ["Hour,Period,Flow,Energy (kWh)"];
for (let hour = 0; hour < 24; hour++) {
  const flows: [string, number][] = [
    ["Solar", solar(hour)],
    ["Grid import", gridImport(hour)],
    ["Building load", -load(hour)],
    ["Grid export", -gridExport(hour)],
  ];
  for (const [flow, energy] of flows) {
    if (energy !== 0) rows.push(`${hour},${period(hour)},${flow},${energy}`);
  }
}
writeFileSync(output, `${rows.join("\n")}\n`);
