/**
 * Writes the figures on W. E. B. Du Bois's plate "Income and expenditure of
 * 150 Negro families in Atlanta, Ga., U.S.A." (1900 Paris Exposition): for
 * each annual income class, the families' actual average income and the
 * share of it spent on rent, food, clothes, and direct taxes, with the rest
 * on other expenses and savings. The values are read from the plate, as in
 * the #DuBoisChallenge data. A class that paid no rent has no rent row.
 *
 *   node --experimental-strip-types du_bois_income.ts <output.csv>
 */
import { writeFileSync } from "node:fs";

const output = process.argv[2] ?? "du-bois-income.csv";

const categories = [
  "Rent",
  "Food",
  "Clothes",
  "Direct taxes",
  "Other expenses and savings",
];
const classes: { label: string; average: number; shares: number[] }[] = [
  { label: "$100–200", average: 139.1, shares: [19, 43, 28, 0.1, 9.9] },
  { label: "$200–300", average: 249.45, shares: [22, 47, 23, 4, 4] },
  { label: "$300–400", average: 335.66, shares: [23, 43, 18, 4.5, 11.5] },
  { label: "$400–500", average: 433.82, shares: [18, 37, 15, 5.5, 24.5] },
  { label: "$500–750", average: 547, shares: [13, 31, 17, 5, 34] },
  { label: "$750–1,000", average: 880, shares: [0, 37, 19, 8, 36] },
  { label: "$1,000 and over", average: 1125, shares: [0, 29, 16, 4.5, 50.5] },
];

const rows: string[] = ["Class,Order,Average income,Category,Share"];
classes.forEach(({ label, average, shares }, index) =>
  shares.forEach((share, at) => {
    if (share > 0)
      rows.push(
        `"${label}",${index + 1},${average},${categories[at]},${share}`
      );
  })
);
writeFileSync(output, `${rows.join("\n")}\n`);
