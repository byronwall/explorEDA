/**
 * Writes the figures behind Pew Research Center's chart "Republicans and
 * Democrats in the U.S. differ over some factors that make life meaningful"
 * (November 2021): the share of each party's respondents who mentioned a
 * topic. The seven topics and values are the ones the published chart
 * shows, in its editorial order, as transcribed in the R Graph Gallery's
 * dumbbell recreation.
 *
 *   node --experimental-strip-types pew_meaning.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "pew-meaning.csv";

const topics: { topic: string; dem: number; rep: number }[] = [
  { topic: "Spirituality, faith and religion", dem: 8, rep: 22 },
  { topic: "Freedom and independence", dem: 6, rep: 12 },
  { topic: "Hobbies and recreation", dem: 13, rep: 7 },
  { topic: "Physical and mental health", dem: 13, rep: 9 },
  { topic: "COVID-19", dem: 8, rep: 5 },
  { topic: "Pets", dem: 5, rep: 2 },
  { topic: "Nature and the outdoors", dem: 5, rep: 3 },
];

const rows: string[] = ["Topic,Order,Party,Share"];
topics.forEach(({ topic, dem, rep }, index) => {
  rows.push(`"${topic}",${index + 1},Dem/Lean Dem,${dem}`);
  rows.push(`"${topic}",${index + 1},Rep/Lean Rep,${rep}`);
});

writeFileSync(output, `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} topic-party shares written to ${output}`);
