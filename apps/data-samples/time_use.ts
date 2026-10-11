/**
 * Writes an illustrative time-use diary for the composition demo: minutes
 * per day that respondents spent on twelve activities, for a 2019 cohort and
 * a 2020 cohort. The 2020 shifts follow the familiar pandemic pattern. The
 * figures are synthetic and unweighted. The fixed seed makes the file stable.
 *
 *   node --experimental-strip-types time_use.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "time-use.csv";

let state = 0x74696d65;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// A roughly normal draw from the sum of three uniforms.
const noise = () => random() + random() + random() - 1.5;

interface Activity {
  name: string;
  /** Typical minutes a day in 2019, and how spread out respondents are. */
  median: number;
  spread: number;
  /** Share of respondents who do it at all. */
  share: number;
  /** Multiplier on 2020 minutes. */
  shift: number;
}

const activities: Activity[] = [
  { name: "Sleeping", median: 510, spread: 60, share: 1, shift: 1.05 },
  { name: "Working", median: 420, spread: 120, share: 0.62, shift: 0.88 },
  {
    name: "Eating and drinking",
    median: 70,
    spread: 25,
    share: 0.98,
    shift: 1.08,
  },
  { name: "Housework", median: 60, spread: 40, share: 0.7, shift: 1.2 },
  { name: "Watching TV", median: 150, spread: 80, share: 0.85, shift: 1.25 },
  { name: "Traveling", median: 75, spread: 35, share: 0.9, shift: 0.6 },
  {
    name: "Caring for children",
    median: 90,
    spread: 60,
    share: 0.32,
    shift: 1.35,
  },
  { name: "Socializing", median: 45, spread: 30, share: 0.5, shift: 0.55 },
  { name: "Exercise", median: 40, spread: 25, share: 0.3, shift: 1.15 },
  { name: "Shopping", median: 35, spread: 20, share: 0.45, shift: 0.7 },
  { name: "Reading", median: 30, spread: 20, share: 0.25, shift: 1.3 },
  {
    name: "Games and computer",
    median: 50,
    spread: 40,
    share: 0.3,
    shift: 1.5,
  },
];

const AGE_GROUPS = ["15–24", "25–44", "45–64", "65+"];
const RESPONDENTS_PER_YEAR = 400;

const rows: string[] = ["Year,Activity,Respondent,Age group,Weekday,Minutes"];
for (const year of [2019, 2020]) {
  for (let person = 1; person <= RESPONDENTS_PER_YEAR; person += 1) {
    const id = `${year}-${String(person).padStart(3, "0")}`;
    const age = AGE_GROUPS[Math.floor(random() * AGE_GROUPS.length)]!;
    const weekday = random() < 5 / 7 ? "Weekday" : "Weekend";
    for (const activity of activities) {
      // Some respondents skip an activity that day: no row, not a zero.
      if (random() > activity.share) continue;
      const shift = year === 2020 ? activity.shift : 1;
      const minutes = Math.max(
        5,
        Math.round((activity.median + noise() * activity.spread) * shift)
      );
      rows.push(`${year},${activity.name},${id},${age},${weekday},${minutes}`);
    }
  }
}

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} diary entries written to ${output}`);
