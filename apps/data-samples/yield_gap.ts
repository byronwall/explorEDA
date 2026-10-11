/**
 * Writes an illustrative yield-gap table for the waffle-histogram demo: for
 * wheat and maize, one row per country with its continent and its yield
 * gap, the tonnes per hectare between what its farms harvest and what they
 * could, rounded to whole tonnes. The counts by continent follow the broad
 * shape of the published "Yield Gap" graphic; the countries and values are
 * synthetic. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types yield_gap.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "yield-gap.csv";

let state = 0x7969656c;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// A roughly normal draw from the sum of three uniforms.
const noise = () => random() + random() + random() - 1.5;

// Countries per continent, and the typical gap and spread for each crop.
const continents: {
  name: string;
  countries: number;
  wheat: [number, number];
  maize: [number, number];
}[] = [
  { name: "Africa", countries: 30, wheat: [1.2, 1.2], maize: [1.3, 1.1] },
  { name: "Asia", countries: 28, wheat: [2, 1.6], maize: [4, 3.4] },
  { name: "Europe", countries: 30, wheat: [4.6, 2.6], maize: [6, 3.2] },
  {
    name: "Central and North America",
    countries: 10,
    wheat: [2.5, 2.2],
    maize: [2.2, 2.6],
  },
  { name: "South America", countries: 10, wheat: [2.2, 1.6], maize: [3, 2.2] },
  { name: "Oceania", countries: 4, wheat: [3, 3], maize: [5, 4] },
];

const rows: string[] = ["Crop,Continent,Country,Yield gap"];
for (const crop of ["Wheat", "Maize (corn)"] as const) {
  for (const continent of continents) {
    const [center, spread] =
      crop === "Wheat" ? continent.wheat : continent.maize;
    for (let index = 1; index <= continent.countries; index += 1) {
      // Not every country grows both crops.
      if (random() < 0.12) continue;
      const gap = Math.max(0, Math.round(center + noise() * spread));
      rows.push(
        `${crop},"${continent.name}",${continent.name} ${index},${Math.min(gap, 13)}`
      );
    }
  }
}
writeFileSync(output, `${rows.join("\n")}\n`);
