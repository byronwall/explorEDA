/**
 * Writes an illustrative count table of deaths by single year of age and
 * cause, for the stacked-area composition demo. Each cause follows a
 * plausible age profile; the totals are synthetic and carry no claim about
 * any population. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types causes_by_age.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "causes-by-age.csv";

let state = 0x61676573;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Cause {
  name: string;
  /** Expected deaths at an age, before noise. */
  rate: (age: number) => number;
}

const bump = (age: number, center: number, width: number, height: number) =>
  height * Math.exp(-((age - center) ** 2) / (2 * width * width));
const rising = (age: number, start: number, slope: number) =>
  age < start ? 0 : (age - start) * slope;

const causes: Cause[] = [
  {
    name: "Perinatal conditions",
    rate: (age) => (age === 0 ? 900 : age < 2 ? 60 : 0),
  },
  {
    name: "Accidents",
    rate: (age) => 20 + bump(age, 22, 9, 260) + rising(age, 60, 6),
  },
  {
    name: "Suicide",
    rate: (age) =>
      age < 10 ? 0 : 20 + bump(age, 28, 14, 110) + bump(age, 54, 12, 90),
  },
  {
    name: "Homicide",
    rate: (age) => (age < 1 ? 20 : bump(age, 24, 8, 140) + 8),
  },
  { name: "Cancer", rate: (age) => 8 + bump(age, 72, 14, 1900) },
  {
    name: "Heart disease",
    rate: (age) => 10 + rising(age, 30, 4) + bump(age, 88, 10, 2400),
  },
  { name: "Stroke", rate: (age) => bump(age, 88, 11, 700) },
  { name: "Alzheimer's", rate: (age) => bump(age, 90, 8, 650) },
  {
    name: "Other",
    rate: (age) => 30 + rising(age, 20, 3) + bump(age, 85, 12, 900),
  },
];

const rows: string[] = ["Age,Cause,Count"];
for (let age = 0; age <= 100; age += 1) {
  for (const cause of causes) {
    const expected = cause.rate(age);
    const count = Math.max(0, Math.round(expected * (0.85 + random() * 0.3)));
    rows.push(`${age},${cause.name},${count}`);
  }
}

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} age-cause counts written to ${output}`);
